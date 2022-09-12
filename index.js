const { createWorker } = require('tesseract.js');
const fs = require("fs");
const path = require('path');


const worker = createWorker({
  langPath: path.join(__dirname, 'lang-data'),
  cachePath: path.join(__dirname, 'lang-data'),
  workerPath: path.join(__dirname, 'worker.js'),
  cacheMethod: 'readOnly',
  gzip: false,
  logger: m => console.log(m),
});
const { Configuration, OpenAIApi } = require("openai");

const myFunction = async (input) => {
    const output = {};

    let pdf = input.pdf;
    let key = input.key;
    let model = input.model; 
    let prompt = input.prompt; 
    let completion = input.completion;
    let temperature = input.temperature; 
    let max_tokens =  input.max_tokens; 
    let top_p = input.top_p; 
    let frequency_penalty = input.frequency_penalty; 
    let presence_penalty = input.presence_penalty;

        
    async function coupa(input) {
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');

        const { data: { text } } = await worker.recognize(pdf);console.log(text);
        await worker.terminate();
 
        const configuration = new Configuration({
            apiKey: key,
        });

        const openai = new OpenAIApi(configuration);

        const response = await openai.createCompletion({
          model: model,
          prompt: prompt + "\n\n" + text + "\n\n" + completion,
          temperature: temperature,
          max_tokens: max_tokens,
          top_p: top_p,
          frequency_penalty: frequency_penalty,
          presence_penalty: presence_penalty,
        });

        console.log(response.data.choices[0].text)
    	return(response.data.choices[0].text)        
    }

    output.response = await coupa(input);
    return output;    
}

exports.main = async (input) => {
    return await myFunction(input);

}

const myFunction1 = async () => {
	const input = {};

    let fileInputName = 'ocr1.jpeg';
    let pdf = fs.readFileSync(fileInputName);
    const buff = Buffer.from(pdf);
    const base64 = buff.toString('base64');
    //console.log(base64)

    input.pdf = base64;
    input.key = '';
    input.model = 'text-davinci-002';
    input.prompt = 'extract the receipt number, date and amount from:';
    input.completion = 'the receipt number, date and amount:';
    input.temperature = 0.7;
    input.max_tokens = 256;
    input.top_p = 1;
    input.frequency_penalty = 0;
    input.presence_penalty = 0;
   
    var res = await myFunction(input);
    console.log("Result:")
    console.log(res)  
};
myFunction1();
