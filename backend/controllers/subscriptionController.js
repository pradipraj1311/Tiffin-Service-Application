const Subscription = require("../models/Subscription");
const Chef = require("../models/Chef");

exports.getPlans = (req, res) => {
  const plans = [
    { id: 1, name: "Basic Tier", duration: "1 Month", price: 499 },
    { id: 2, name: "Pro Tier", duration: "6 Months", price: 2499 },
    { id: 3, name: "Premium Tier", duration: "1 Year", price: 4499 },
  ];
  res.status(200).json(plans);
};

exports.subscribe = async (req, res) => {
  try {
    // Find the Chef profile linked to the logged-in User
    const chef = await Chef.findOne({ userId: req.user._id });
    if (!chef) {
      return res
        .status(404)
        .json({ message: "Chef profile not found. Only chefs can subscribe." });
    }

    const subscription = await Subscription.create({
      chefId: chef._id,
      Subscription_Status: true,
    });

    chef.SubscriptionId.push(subscription._id);
    await chef.save();

    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id).populate(
      "chefId",
    );

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getSubscriptionStatus = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.status(200).json({
      subscriptionId: subscription._id,
      status: subscription.Subscription_Status ? "Active" : "Cancelled/Expired",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    subscription.Subscription_Status = false;
    await subscription.save();

    res
      .status(200)
      .json({ message: "Subscription successfully cancelled", subscription });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
