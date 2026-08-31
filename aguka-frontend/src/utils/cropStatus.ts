export function computeCropStatus(
  plantedDate: Date,
  growingDurationDays: number,
  overrideStatus?: string | null,
) {
  const expectedHarvest = new Date(
    plantedDate.getTime() + growingDurationDays * 24 * 60 * 60 * 1000,
  );
  const now = new Date();
  const daysToHarvest = Math.ceil(
    (expectedHarvest.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  const daysPlanted = Math.floor((now.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24));

  const status = (overrideStatus || "").toLowerCase();
  let badgeColor = {
    background: "var(--color-background-secondary)",
    text: "var(--color-text-secondary)",
  };
  let label = status.toUpperCase();

  if (status === "growing" || status === "planted") {
    if (daysToHarvest < 0) {
      label = `OVERDUE · ${Math.abs(daysToHarvest)} days`;
      badgeColor = { background: "#FCEBEB", text: "#791F1F" }; // danger
    } else if (daysToHarvest <= 14) {
      label = `READY · ${daysToHarvest} days`;
      badgeColor = { background: "#FAEEDA", text: "#854F0B" }; // warn
    } else {
      label = `GROWING · ${daysPlanted} days`;
      badgeColor = { background: "#E1F5EE", text: "#0F6E56" }; // good
    }
  } else if (status === "failed") {
    label = "FAILED";
    badgeColor = { background: "#FCEBEB", text: "#791F1F" }; // danger
  } else if (status === "dormant") {
    label = "DORMANT";
    badgeColor = { background: "#F1F5F9", text: "#64748B" }; // muted
  } else if (status === "harvested") {
    label = "HARVESTED";
    badgeColor = { background: "#E0F2FE", text: "#0369A1" }; // primary-ish
  } else {
    label = status.toUpperCase();
  }

  return { label, badgeStyle: badgeColor };
}
