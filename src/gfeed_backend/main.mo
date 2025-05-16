import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Bool "mo:base/Bool";
import IC "mo:ic";
import XML "mo:xml";
import JSON "mo:json";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Types "Types";
import Utils "Utils";
import OpenAI "OpenAI";

actor {

  private var _requestHeaders : [IC.HttpHeader] = [
    { name = "Accept"; value = "*/*" },
    { name = "Accept-Language"; value = "en-US,en;q=0.9" },
    { name = "DNT"; value = "1" },
    {
      name = "Sec-CH-UA";
      value = "\"Chromium\";v=\"136\", \"Microsoft Edge\";v=\"136\", \"Not.A/Brand\";v=\"99\"";
    },
    { name = "Sec-CH-UA-Mobile"; value = "?0" },
    { name = "Sec-CH-UA-Platform"; value = "\"Windows\"" },
    { name = "Sec-Fetch-Dest"; value = "empty" },
    { name = "Sec-Fetch-Mode"; value = "cors" },
    { name = "Sec-Fetch-Site"; value = "cross-site" },
    {
      name = "User-Agent";
      value = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0";
    },
  ];

  private var _channelElement : XML.Element = {
    name = "";
    attributes = [];
    children = #selfClosing;
  };

  private func navigate_to_url(url : Text) : async Blob {
    let httpRequest : IC.HttpRequestArgs = {
      url = url;
      max_response_bytes = null;
      headers = _requestHeaders;
      body = null;
      method = #get;
      transform = ?{
        function = transform;
        context = Blob.fromArray([]);
      };
    };

    let httpResponse : IC.HttpRequestResult = await (with cycles = 230_949_972_000) IC.ic.http_request(httpRequest);
    return httpResponse.body;
  };

  public func fetch_feed() : async Types.FetchFeedResponse {
    let url : Text = "https://www.spglobal.com/spdji/en/rss/rss-details/?rssFeedName=index-news-announcements";
    let httpRequest : IC.HttpRequestArgs = {
      url = url;
      max_response_bytes = null;
      headers = _requestHeaders;
      body = null;
      method = #get;
      transform = ?{
        function = transform;
        context = Blob.fromArray([]);
      };
    };

    //IC management canister will make the HTTP request so it needs cycles
    let httpResponse : IC.HttpRequestResult = await (with cycles = 230_949_972_000) IC.ic.http_request(httpRequest);

    let decodedText : Text = switch (Text.decodeUtf8(httpResponse.body)) {
      case (null) { "" };
      case (?y) { y };
    };

    let defaultResponse : Types.FetchFeedResponse = {
      isOK = false;
      message = "Unable to connect to the feed";
      feedItems = [];
    };

    if (decodedText == "") { return defaultResponse };

    switch (XML.fromText(decodedText.chars())) {
      case (#ok(root)) {
        let channels = Utils.getXmlChildren(root);

        switch (channels[0]) {
          case (#element(value)) {
            _channelElement := value;
            let feedItems = Utils.getRecentFeedItems(_channelElement, 10);
            let response : Types.FetchFeedResponse = {
              isOK = true;
              message = "Success";
              feedItems = feedItems;
            };

            return response;
          };
          case (_) { return defaultResponse };
        };

      };
      case (#err(error)) {
        let readError : Types.FetchFeedResponse = {
          isOK = false;
          message = "Failed to read the feed: " # error;
          feedItems = [];
        };

        return readError;
      };
    };
  };

  public func analyze_feed(feedItemLink : Text) : async Types.AnalyzeFeedResponse {
    let defaultValue : Types.AnalyzeFeedResponse = {
      isOK = false;
      message = "Something went wrong";
      result = "";
    };

    let feedItemPage : Blob = await navigate_to_url(feedItemLink);
    let requestBody : Blob = if (Text.endsWith(feedItemLink, #text ".pdf")) {
      OpenAI.createFileInputRequest(feedItemPage);
    } else {
      let decodedText : Text = switch (Text.decodeUtf8(feedItemPage)) {
        case (null) { return defaultValue };
        case (?y) { y };
      };

      let textParts = Iter.toArray(Text.split(decodedText, #text "</head>"));
      let finalText = if (textParts.size() > 1) {
        textParts[1];
      } else {
        decodedText;
      };

      OpenAI.createTextInputRequest(finalText);
    };

    let apiKey = "";
    let url = "https://api.openai.com/v1/responses";
    let requestHeaders = [
      { name = "Content-Type"; value = "application/json" },
      {
        name = "Authorization";
        value = "Bearer " # apiKey;
      },
    ];

    let httpRequest : IC.HttpRequestArgs = {
      url = url;
      max_response_bytes = null; //optional for request
      headers = requestHeaders;
      body = ?requestBody;
      method = #post;
      transform = ?{
        function = transform;
        context = Blob.fromArray([]);
      };
    };

    let httpResponse : IC.HttpRequestResult = await (with cycles = 230_949_972_000) IC.ic.http_request(httpRequest);
    let decodedText : Text = switch (Text.decodeUtf8(httpResponse.body)) {
      case (null) { return defaultValue };
      case (?y) { y };
    };

    let result = switch (JSON.parse(decodedText)) {
      case (#ok(parsed)) {
        let result = OpenAI.Response(parsed);
        let response : Types.AnalyzeFeedResponse = {
          isOK = true;
          message = "Success";
          result = result.getText(0, 0);
        };

        return response;
      };
      case (#err(e)) {
        Debug.print("analyze_feed result error " # debug_show e);
        return defaultValue;
      };
    };

    return result;
  };

  public query func rate_money_move(moveId : Text, isLiked : Bool) : async Bool {
    return true;
  };

  //function to transform the response
  public query func transform({
    context : Blob;
    response : IC.HttpRequestResult;
  }) : async IC.HttpRequestResult {
    return {
      response with headers = [];
    };
  };

};
