/**
 * Templates for AI prompt generation
 */
exports.createToneAdjustmentPrompt = (text, toneDescription) => {
  return `
Please rewrite the following text to make it sound ${toneDescription}. 
Maintain all the original information and meaning, but adjust the tone, word choice, and sentence structure.
Do not add any new information or explanations.
Only respond with the rewritten text, without any additional comments or explanations.

Original text:
${text}
`;
};