import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import XML "mo:xml";
import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Random "mo:base/Random";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Types "Types";

module {

    public func byteToBase64(byte : Nat8) : Text {
        let base64Chars = Text.toArray("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
        let index = Nat8.toNat(byte >> 2);
        let char = base64Chars[index];
        Debug.print("byteToBase64 index " # debug_show index);
        Debug.print("byteToBase64 char " # debug_show char);

        return Text.fromChar(char);
    };

    public func getXmlChildren(element : XML.Element) : [XML.ElementChild] {
        switch (element.children) {
            case (#open(children)) { children };
            case (#selfClosing) { [] };
        };
    };

    public func getTextFromElement(el : XML.Element) : Text {
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

    public func xmlToText(element : XML.Element) : Text {
        let iterChars = XML.toText(element);
        Text.fromIter(iterChars);
    };

    public func xmlToFeedItem(element : XML.Element) : Types.FeedItem {
        let children = getXmlChildren(element);

        var title = "";
        var source = "";
        var description = "";
        var link = "";
        var datetime = "";

        for (child in children.vals()) {
            switch (child) {
                case (#element(el)) {
                    if (el.name == "title") {
                        title := getTextFromElement(el);
                    };
                    if (el.name == "link") { link := getTextFromElement(el) };
                    if (el.name == "source") {
                        source := getTextFromElement(el);
                    };
                    if (el.name == "description") {
                        description := getTextFromElement(el);
                    };
                    if (el.name == "pubDate") {
                        datetime := getTextFromElement(el);
                    };
                };
                case _ {};
            };
        };

        let feedItem : Types.FeedItem = {
            title = title;
            source = source;
            datetime = datetime;
            description = description;
            link = link;
        };

        return feedItem;
    };

    public func getRecentFeedItems(feedChannel : XML.Element, count : Nat) : [Types.FeedItem] {
        var recentItems : [Types.FeedItem] = [];
        let children = getXmlChildren(feedChannel);
        Debug.print("getRecentFeedItems count " # Nat.toText(count) # " feed items count " # Nat.toText(children.size()));

        for (child in children.vals()) {
            if (recentItems.size() >= count) {
                return recentItems;
            };

            switch (child) {
                case (#element(el)) {
                    if (el.name == "item") {
                        recentItems := Array.append(recentItems, [xmlToFeedItem(el)]);
                    };
                };
                case (_) {};
            };
        };

        recentItems;
    };

    public func generateId() : Text {
        let hexValues : [Text] = ["a", "b", "c", "d", "e", "f"];
        let timeRef = Time.now();

        var id : Text = "";
        for (i in Iter.range(0, 15)) {
            let now = Int.abs(Time.now());
            let seed = Blob.fromArray([Nat8.fromNat(now % 256), Nat8.fromNat(i)]);
            let hexNumber = Random.rangeFrom(4, seed);
            Debug.print("now " # debug_show now);
            Debug.print("seed " # debug_show seed);
            Debug.print("hexNumber " # debug_show hexNumber);

            let value = if (hexNumber > 9 and hexNumber < 16) {
                hexValues[hexNumber - 10];
            } else if (hexNumber >= 16) {
                "-";
            } else { Nat.toText(hexNumber) };

            Debug.print("value " # value);
            id := id # value;
        };

        let finalId : Text = Int.toText(timeRef) # "-" # id;
        Debug.print("generateId final id " # finalId);

        return finalId;
    };
};
