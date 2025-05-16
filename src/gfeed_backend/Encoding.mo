import Iter "mo:base/Iter";
import Nat32 "mo:base/Nat32";
import Nat8 "mo:base/Nat8";
import Nat "mo:base/Nat";
import Char "mo:base/Char";
import Prelude "mo:base/Prelude";
import Blob "mo:base/Blob";

module {
    let valueToCharTable : [Char] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/'];
    let valueToCharTableUriSafe : [Char] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '_'];

    public func blobToBase64(blob : Blob) : Text {
        return toBase64(Iter.fromArray(Blob.toArray(blob)), false);
    };

    public func toBase64(data : Iter.Iter<Nat8>, isUriSafe : Bool) : Text {
        var ret = "";
        var remain : Nat32 = 0;
        var bits : Nat32 = 0;
        var bitcount = 0;

        for (byte in data) {
            bitcount += 8;
            let b = Nat32.fromNat(Nat8.toNat(byte));
            remain += 8;
            bits <<= 8;
            bits |= b;

            while (remain >= 6) {
                let index = (bits >> (remain - 6)) & 0x3f;
                let ?base64Char = base64CharFromValue(index, isUriSafe) else Prelude.unreachable();
                ret #= Char.toText(base64Char);
                remain -= 6;
            };

            bits := b & (2 ** remain - 1);
        };

        if (remain != 0) {
            bits <<= (6 - remain);
            let index = bits & 0x3f;
            let ?base64Char = base64CharFromValue(index, isUriSafe) else Prelude.unreachable();
            ret #= Char.toText(base64Char);
        };

        // Add padding for standard Base64
        if (not isUriSafe) {
            let extraBytes = bitcount % 3;
            if (extraBytes > 0) {
                for (_ in range(0, extraBytes)) ret #= "=";
            };
        };

        ret;
    };

    private func base64CharFromValue(value : Nat32, isUriSafe : Bool) : ?Char {
        if (value >= 64) {
            return null;
        };

        // Convert to Nat for array indexing
        let index = Nat32.toNat(value);

        // Use the appropriate lookup table based on isUriSafe
        if (isUriSafe) {
            return ?valueToCharTableUriSafe[index];
        } else {
            return ?valueToCharTable[index];
        };
    };

    private func range(fromInclusive : Nat, toExclusive : Nat) : Iter.Iter<Nat> = object {
        var n = fromInclusive;
        public func next() : ?Nat {
            if (n >= toExclusive) {
                return null;
            };
            let current = n;
            n += 1;
            ?current;
        };
    };
};
