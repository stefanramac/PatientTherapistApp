const axios = require('axios');
const fs = require('fs');

const apiKey = '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';

const jsFiles = [
    './createPatient.js',
    './createTherapist.js',
    './getPatients.js',
    './getTherapists.js',
    './insertTimeSlot.js',
    './checkAvailability.js'
  ];
  
  const readJsFiles = (files) => {
    return files.map(file => {
      const content = fs.readFileSync(file, 'utf-8');
      return content;
    }).join('\n\n');
  };
  
  const generateSwaggerYaml = async (jsCode) => {
    const prompt = `Generate a Swagger YAML documentation based on the following JavaScript code: \n\n${jsCode}`;
    
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.7,
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
  
      return response.data.choices[0].message.content;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        console.log(`Rate limit exceeded. Please retry after ${retryAfter || 'a few'} seconds.`);
        setTimeout(() => {
          return generateSwaggerYaml(jsCode); // Retry after specified time
        }, (retryAfter || 60) * 1000);  // Retry after retryAfter seconds, or default to 60 seconds
      } else {
        throw error;
      }
    }
  };
  
  const main = async () => {
    const jsCode = readJsFiles(jsFiles);
    const swaggerYaml = await generateSwaggerYaml(jsCode);
  
    if (swaggerYaml) {
      fs.writeFileSync('./swagger_output.yaml', swaggerYaml, 'utf-8');
      console.log('Swagger YAML dokumentacija je generisana i sačuvana u swagger_output.yaml');
    } else {
      console.log('Failed to generate Swagger YAML.');
    }
  };
  
  main().catch(console.error);