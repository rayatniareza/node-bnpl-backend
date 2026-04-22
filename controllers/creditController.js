const GetEligibleCreditProductsQuery = require('../queries/GetEligibleCreditProductsQuery');

const getEligibleProducts = async (req, res) => {
  const userId = req.user.userId;

  try {
    const products = await GetEligibleCreditProductsQuery.execute(userId);
    res.status(200).json({ products });
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getEligibleProducts
};
