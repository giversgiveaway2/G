import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Bool "mo:base/Bool";
import Iter "mo:base/Iter";
import IC "mo:ic";
import XML "mo:xml";
import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Nat "mo:base/Nat";

actor {
  public type FeedItem = {
    title : Text;
    source : Text;
    datetime : Text;
    description : Text;
    link : Text;
  };

  public type FetchFeedResponse = {
    isOK : Bool;
    message : Text;
    feedItems : [FeedItem];
  };

  private let _requestHeaders : [IC.HttpHeader] = [
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

  private func xml_to_feed_item(element : XML.Element) : FeedItem {
    let children = get_xml_children(element);

    var title = "";
    var source = "";
    var description = "";
    var link = "";
    var datetime = "";

    for (child in children.vals()) {
      switch (child) {
        case (#element(el)) {
          if (el.name == "title") { title := get_text_from_element(el) };
          if (el.name == "link") { link := get_text_from_element(el) };
          if (el.name == "source") { source := get_text_from_element(el) };
          if (el.name == "description") {
            description := get_text_from_element(el);
          };
          if (el.name == "pubDate") { datetime := get_text_from_element(el) };
        };
        case _ {};
      };
    };

    let feedItem : FeedItem = {
      title = title;
      source = source;
      datetime = datetime;
      description = description;
      link = link;
    };

    return feedItem;
  };

  public func get_recent_feed_items(count : Nat) : async [FeedItem] {
    var recentItems : [FeedItem] = [];
    let children = get_xml_children(_channelElement);
    Debug.print("get_recent_feed_items count " # Nat.toText(count) # " feed items count " # Nat.toText(children.size()));

    for (child in children.vals()) {
      if (recentItems.size() >= count) {
        return recentItems;
      };

      switch (child) {
        case (#element(el)) {
          if (el.name == "item") {
            recentItems := Array.append(recentItems, [xml_to_feed_item(el)]);
          };
        };
        case (_) {};
      };
    };

    recentItems;
  };

  public func open_file() : async [Nat8] {
    let url : Text = "https : //www.spglobal.com/spdji/en/documents/index-news-and-announcements/20250429-iboxx-asia-list-private-placement-bonds.pdf";
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

    let http_response : IC.HttpRequestResult = await (with cycles = 230_949_972_000) IC.ic.http_request(httpRequest);
    Blob.toArray(http_response.body);
  };

  private func xml_to_text(element : XML.Element) : Text {
    let iterChars = XML.toText(element);
    Text.fromIter(iterChars);
  };

  private func get_text_from_element(el : XML.Element) : Text {
    switch (el.children) {
      case (#selfClosing) { "" };
      case (#open(children)) {
        var texts : [Text] = [];
        for (child in children.vals()) {
          switch (child) {
            case (#text(t)) { texts := Array.append(texts, [t]) };
            case _ {};
          };
        };
        Text.join("", Iter.fromArray(texts));
      };
    };
  };

  private func get_xml_children(element : XML.Element) : [XML.ElementChild] {
    switch (element.children) {
      case (#open(children)) { children };
      case (#selfClosing) { [] };
    };
  };

  public func fetch_feed() : async FetchFeedResponse {
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
    let http_response : IC.HttpRequestResult = await (with cycles = 230_949_972_000) IC.ic.http_request(httpRequest);

    let decodedText : Text = switch (Text.decodeUtf8(http_response.body)) {
      case (null) { "" };
      case (?y) { y };
    };

    var response : FetchFeedResponse = {
      isOK = false;
      message = "Unable to connect to the feed";
      feedItems = [];
    };

    if (decodedText == "") { return response };

    switch (XML.fromText(decodedText.chars())) {
      case (#ok(root)) {
        let channels = get_xml_children(root);

        switch (channels[0]) {
          case (#element(value)) {
            _channelElement := value;
            let feedItems = await get_recent_feed_items(10);

            response := {
              isOK = false;
              message = "Successfully retrieved feed items";
              feedItems = feedItems;
            };

            return response;
          };
          case (_) { return response };
        };

      };
      case (#err(error)) {
        response := {
          isOK = false;
          message = "Failed to read the feed: " # error;
          feedItems = [];
        };

        return response;
      };
    };
  };

  //function to transform the response
  public query func transform({
    context : Blob;
    response : IC.HttpRequestResult;
  }) : async IC.HttpRequestResult {
    {
      response with headers = [];
    };
  };

  public query func rate_money_move(moveId : Text, isLiked : Bool) : async Bool {
    return true;
  };
};
