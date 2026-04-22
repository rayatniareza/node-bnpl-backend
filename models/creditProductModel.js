const creditProducts = [];

const create = async (productData) => {
  const productId = `cp_${creditProducts.length + 1}`;
  const newProduct = {
    productId,
    ...productData,
    status: 'Active',
    createdAt: new Date()
  };
  creditProducts.push(newProduct);
  return newProduct;
};

const findById = async (productId) => {
  return creditProducts.find(p => p.productId === productId);
};

const findAll = async () => {
  return creditProducts;
};

const findActive = async () => {
  return creditProducts.filter(p => p.status === 'Active');
};

module.exports = {
  create,
  findById,
  findAll,
  findActive,
  creditProducts
};
