module {
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

  public type AnalyzeFeedResponse = {
    isOK : Bool;
    message : Text;
    result : Text;
  };
};
