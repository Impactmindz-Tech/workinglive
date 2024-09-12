export const getCurrencySymbol = () => {
    switch ('USD') {
      case 'INR':
        return '₹';
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      // Add more currencies as needed
      default:
        return '';
    }
  };
  