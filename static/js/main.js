document.addEventListener("DOMContentLoaded", () => {
  const checks = document.querySelectorAll('input[name="skills"]');
  const count = document.getElementById("selectedCount");
  const updateCount = () => {
    if (count) count.textContent = document.querySelectorAll('input[name="skills"]:checked').length;
  };
  checks.forEach((item) => item.addEventListener("change", updateCount));
  updateCount();

  document.querySelectorAll(".flash").forEach((flash) => {
    window.setTimeout(() => {
      flash.classList.add("flash-hide");
      window.setTimeout(() => flash.remove(), 400);
    }, 4500);
  });
});
