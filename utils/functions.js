import content from "./content";

export const getRegisterConfig = (required, minLength, maxLength) => {
  const result = {};

  if (required) result.required = content.required;

  if (minLength)
    result.minLength = {
      value: minLength,
      message: content.getMinLengthText(minLength)
    }
  
  if (maxLength)
    result.maxLength = {
      value: maxLength,
      message: content.getMaxLengthText(maxLength)
    }
  
  return result;
}


