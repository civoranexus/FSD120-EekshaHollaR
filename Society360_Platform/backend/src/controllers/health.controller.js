exports.healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Society360 Backend is running successfully",
    company: "Civora Nexus Pvt. Ltd.",
    project: "Society360 – Smart Residential Management System",
  });
};
