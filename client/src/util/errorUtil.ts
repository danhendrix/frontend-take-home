
export const getErrorMessage = (type: string, errorMsg: string, tryAgain = true) => (
    `There was a problem ${type}: ${errorMsg}. ${tryAgain ? 'Please try again.' : ''}`
);