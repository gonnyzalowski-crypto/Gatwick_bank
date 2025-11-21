// Generate Bitcoin wallet address (starts with bc1)
export const generateBitcoinAddress = () => {
  const chars = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  let address = 'bc1q';
  // Bitcoin bech32 addresses are typically 42 characters (bc1 + 39 chars)
  for (let i = 0; i < 39; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
};

// Generate Ethereum wallet address (starts with 0x)
export const generateEthereumAddress = () => {
  const chars = '0123456789abcdef';
  let address = '0x';
  // Ethereum addresses are 40 hex characters after 0x
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
};

// Generate USDT wallet address (uses Ethereum format)
export const generateUSDTAddress = () => {
  return generateEthereumAddress();
};

// Generate wallet address based on crypto type
export const generateCryptoWalletAddress = (cryptoType = 'BTC') => {
  switch (cryptoType.toUpperCase()) {
    case 'BTC':
    case 'BITCOIN':
      return generateBitcoinAddress();
    case 'ETH':
    case 'ETHEREUM':
      return generateEthereumAddress();
    case 'USDT':
    case 'TETHER':
      return generateUSDTAddress();
    default:
      // Default to Ethereum format for unknown types
      return generateEthereumAddress();
  }
};

// Detect crypto type from account name
export const detectCryptoType = (accountName) => {
  if (!accountName) return 'BTC';
  
  const name = accountName.toUpperCase();
  if (name.includes('BTC') || name.includes('BITCOIN')) return 'BTC';
  if (name.includes('ETH') || name.includes('ETHEREUM')) return 'ETH';
  if (name.includes('USDT') || name.includes('TETHER')) return 'USDT';
  
  return 'BTC'; // Default
};
