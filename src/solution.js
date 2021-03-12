const fetch = require('node-fetch');

class Solution {

    documentUrl = "http://norvig.com/big.txt";
    dictionaryApi = "https://dictionary.yandex.net/api/v1/dicservice.json/lookup";
    dictionaryApiKey = "dict.1.1.20210216T114936Z.e4989dccd61b9626.373cddfbfb8a3b2ff30a03392b4e0b076f14cff9";
    text = "";
    textToArray = []
    orderByWordOccurence = {};
    noOfTopWord = 10;
    wordCount = {};

    constructor() {
    }

    async fetchText() {
        this.text = await (await fetch(this.documentUrl)).text();
    }

    getWordCount() {
        return new Promise(async (resolve, reject) => {

            await this.filterWords();

            let wordCount = [];

            //count word occurence
            this.textToArray.forEach((word) => {
                wordCount[word] = wordCount[word] ? wordCount[word] : 0;
                wordCount[word]++;
            });

            this.wordCount = wordCount;

            const key = Object.keys(wordCount);
            
            //sort them with there count
            let _ = key.sort(function (a, b) {
                return wordCount[b] - wordCount[a];
            }).slice(0, this.noOfTopWord);

            resolve(_);

        }, function (error) {
            console.log(error);
        });
    }

    async filterWords() {

        //replace all the character which is not alphabet
        let cleantext = this.text.replace(/[^a-zA-Z ]/g, " ");
        
        this.textToArray = cleantext.split(" ");

        this.textToArray = this.textToArray.filter((text) => {
            return /\S/.test(text);
        });

        //convert all the character to lowercase.
        this.textToArray = this.textToArray.map((text) => {
            return text.toLowerCase();
        });
    }

    async getSolution() {
        return new Promise(async (resolve, reject) => {
            
            this.orderByWordOccurence = await this.getWordCount();

            let responseObject = [];
            let noOfRecordPrecess = 0;
            this.orderByWordOccurence.forEach(async (_word, index) => {
                
                let wordResponse = {};
                wordResponse.word = _word;
                wordResponse.output = {}
               
                this.getDictionaryResponse(_word).then((data)=>{
                    let _details = JSON.parse(data);

                    if (_details.def[0]) {
                        if ("syn" in _details.def[0]) {
                            wordResponse.output.synonyms = _details.def[0].syn;
                        } else {
                            if ("mean" in _details.def[0]) {
                                wordResponse.synonyms = _details.def[0].mean;
                            } else {
                                wordResponse.output.synonyms = "Not found";
                            }
                        }
                        if ("pos" in _details.def[0]) {
                            wordResponse.output.pos = _details.def[0].pos;
                        } else {
                            wordResponse.output.pos = "Not found";
                        }
                    } else {
                        wordResponse.output.synonyms = "Not found";
                        wordResponse.output.pos = "Not found";
                    }

                    wordResponse.output.count = this.wordCount[_word];

                    responseObject.push(wordResponse);
                    
                    noOfRecordPrecess++;

                    if (this.noOfTopWord == noOfRecordPrecess) {
                        responseObject = responseObject.sort(function (a, b) {
                            return b.output.count - a.output.count;
                        })
                        resolve(responseObject);
                    }
                });

            });

        }, error => {
            reject(error);
        })
    }


    async getDictionaryResponse(word) {
        return await (await (fetch(`${this.dictionaryApi}?key=${this.dictionaryApiKey}&lang=en-en&text=${word}`))).text();
    }


}
const _solution = new Solution();

module.exports = _solution;

