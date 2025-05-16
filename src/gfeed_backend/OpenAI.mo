import JSON "mo:json";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Encoding "Encoding";

module {
    let _indexChangesFormat : Text = ", \"text\": {\"format\": {\"type\": \"json_schema\",\"name\": \"stock_index_changes\",\"schema\": {\"type\": \"object\",\"properties\": {\"hasChanged\": {\"type\": \"boolean\",\"description\": \"A boolean indicating if there have been stocks removed or added in the index.\"},\"tickersAdded\": {\"type\": \"array\",\"description\": \"An array of ticker symbols of added stocks.\",\"items\": {\"type\": \"string\",\"description\": \"The ticker symbol of the added stock.\"}},\"tickersRemoved\": {\"type\": \"array\",\"description\": \"An array of ticker symbols of removed stocks.\",\"items\": {\"type\": \"string\",\"description\": \"The ticker symbol of the removed stock.\"}},\"effectiveDate\": {\"type\": \"string\",\"description\": \"The effective date in the format YYYY-mm-dd.\"},\"index\": {\"type\": \"string\",\"description\": \"The name of the index in which the changes occurred.\"}},\"required\": [\"hasChanged\",\"tickersAdded\",\"tickersRemoved\",\"effectiveDate\",\"index\"],\"additionalProperties\": false},\"strict\": true}}";

    public class Response(ref : JSON.Json) {
        let _object : JSON.Json = ref;

        public func getText(ouputIndex : Nat, contentIndex : Nat) : Text {
            let text = JSON.get(_object, "output[" # Nat.toText(ouputIndex) # "].content[" # Nat.toText(contentIndex) # "].text");
            let value = switch (text) {
                case (?hasValue) {
                    switch (hasValue) {
                        case (#string(value)) { value };
                        case (_) { "" };
                    };
                };
                case null { "" };
            };

            return value;
        };
    };

    private func toJsonSafeText(text : Text) : Text {
        let spacePattern : Text.Pattern = #predicate(func(c) { c == '\n' or c == '\r' or c == '\t' });
        let noBackslash = Text.replace(text, #char '\\', "\\\\");
        let noJump = Text.replace(noBackslash, spacePattern, " ");
        let okText = Text.replace(noJump, #char '\"', "\\\"");
        return okText;
    };

    public func createTextInputRequest(text : Text) : Blob {
        let finalText = toJsonSafeText(text);
        let inputStart : Text = ", \"input\": [{\"role\": \"system\",\"content\": \"Summarize the financial information from this content.\"},{\"role\": \"user\",\"content\": \"";
        let inputEnd : Text = "\"}]}";
        let request : Text = "{ \"model\" : \"gpt-4.1-nano\", \"store\" : false" # _indexChangesFormat # inputStart # finalText # inputEnd;

        return Text.encodeUtf8(request);
    };

    public func createFileInputRequest(file : Blob) : Blob {
        let base64Text : Text = Encoding.blobToBase64(file);
        let inputStart : Text = ", \"input\": [{\"role\": \"system\",\"content\": \"Summarize the financial information from this content.\"},{\"role\": \"user\",\"content\": [{\"type\": \"input_file\",\"filename\": \"financenews.pdf\",\"file_data\": \"data:application/pdf;base64,";
        let inputEnd : Text = "\"}]}]}";
        let request : Text = "{ \"model\" : \"gpt-4.1-nano\", \"store\" : false" # _indexChangesFormat # inputStart # base64Text # inputEnd;

        return Text.encodeUtf8(request);
    };

    public func send_chat() {
        let requestBodyJSON : Text = "{ \"model\" : \"gpt-4.1-nano\", \"input\" : \"Write a 1 word.\" }";
        let requestBody : Blob = Text.encodeUtf8(requestBodyJSON);

    };
};
