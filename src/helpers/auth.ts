export const parseError = (error: any): string => {
  if (error.errors?.length) {
    return error.errors[0].message;
  }
  return error.message || 'Something went wrong';
};
