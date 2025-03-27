/**
 * Represents the result of a MeCab morphological analysis for a single morpheme.
 * Based on the standard MeCab output format:
 * Surface\tPOS,POS-subcat1,POS-subcat2,POS-subcat3,Conjugation-type,Conjugation-form,Lemma,Reading,Pronunciation
 */
export interface MecabResult {
    /** The surface form of the word as it appears in the text. */
    word: string;
    /** Part-of-speech tag (e.g., 名詞, 動詞, 助詞). */
    pos: string;
    /** Part-of-speech sub-category 1 (e.g., 一般, 自立, 格助詞). */
    pos_detail1: string;
    /** Part-of-speech sub-category 2. Often '*' if not applicable. */
    pos_detail2: string;
    /** Part-of-speech sub-category 3. Often '*' if not applicable. */
    pos_detail3: string;
    /** Conjugation type (e.g., 五段・ラ行, 一段, カ変・クル). Often '*' if not applicable. */
    conjugation1: string;
    /** Conjugation form (e.g., 基本形, 未然形, 連用形). Often '*' if not applicable. */
    conjugation2: string;
    /** The dictionary (lemma) form of the word. */
    dictionary_form: string;
    /** The reading of the word, usually in Katakana. */
    reading: string;
    /** The pronunciation of the word, usually in Katakana. May differ from reading for things like particles. */
    pronunciation: string;
}

/**
 * Provides static methods to interact with the MeCab morphological analyzer
 * loaded via WebAssembly.
 */
declare class Mecab {
    /**
     * Waits for the underlying WebAssembly module (libmecab) to be loaded and initialized.
     * This promise must resolve successfully before `query` can be called.
     * It's recommended to await this method once at the start of your application.
     *
     * @example
     * ```typescript
     * import Mecab from 'your-mecab-module-path';
     *
     * async function main() {
     *   try {
     *     await Mecab.waitReady();
     *     console.log("MeCab is ready.");
     *     // Now you can use Mecab.query
     *   } catch (error) {
     *     console.error("Failed to initialize MeCab:", error);
     *   }
     * }
     * main();
     * ```
     */
    static waitReady(): Promise<void>;

    /**
     * Performs morphological analysis on the input string using the initialized MeCab instance.
     *
     * Throws an error if `waitReady()` has not completed successfully before this method is called.
     *
     * @param str The Japanese text string to analyze.
     * @returns An array of `MecabResult` objects, each representing a morpheme found in the string.
     *          Returns an empty array if the analysis fails for the given string (e.g., internal MeCab error).
     *
     * @example
     * ```typescript
     * // Assuming Mecab.waitReady() has already been awaited
     * const text = "すもももももももものうち";
     * const results = Mecab.query(text);
     * results.forEach(token => {
     *   console.log(`${token.word}\t${token.pos},${token.reading}`);
     * });
     * // Output might look like:
     * // すもも	名詞,スモモ
     * // も	助詞,モ
     * // もも	名詞,モモ
     * // も	助詞,モ
     * // もも	名詞,モモ
     * // の	助詞,ノ
     * // うち	名詞,ウチ
     * ```
     */
    static query(str: string): MecabResult[];
}

// Declare the default export of the module
export default Mecab;

// Note: The types related to `LoadMecab` and the Emscripten module instance (`lib`)
// are considered internal implementation details of this specific JS module.
// Consumers of this module typically only need the static methods provided by the `Mecab` class.
// If you needed to interact with the loader directly, you might need a separate
// declaration file for "./libmecab.js" or add more detailed types here,
// potentially using `declare module "./libmecab.js" { ... }`.