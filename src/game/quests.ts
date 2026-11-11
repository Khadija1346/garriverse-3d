export type QuestEvent = "prepare_plot" | "plant_cassava" | "water_cassava" | "harvest_cassava" | "process_garri" | "deliver_garri" | "community_join";
export type QuestDefinition = {
  id: string; title: string; description: string; culturalNote: string;
  event: QuestEvent; target: number; xpReward: number; repeatable: boolean;
  district: "Farm" | "Water" | "Processing" | "Market" | "Community";
};

export const QUESTS: readonly QuestDefinition[] = [
  { id: "first-furrow", title: "Prepare Your First Farmland", description: "Prepare one cassava plot for planting.", culturalNote: "Cassava farming begins with preparing healthy soil.", event: "prepare_plot", target: 1, xpReward: 20, repeatable: false, district: "Farm" },
  { id: "cassava-starter", title: "Plant Your First Cassava", description: "Plant cassava cuttings in prepared plots.", culturalNote: "Cassava is propagated from stem cuttings in many Nigerian farming communities.", event: "plant_cassava", target: 3, xpReward: 35, repeatable: false, district: "Farm" },
  { id: "keep-it-growing", title: "Care for the Crop", description: "Water cassava plots three times.", culturalNote: "Good crop care supports healthy growth through the farming season.", event: "water_cassava", target: 3, xpReward: 30, repeatable: false, district: "Water" },
  { id: "first-harvest", title: "Bring in the Cassava", description: "Harvest cassava from three mature plants.", culturalNote: "Harvesting marks the transition from farm work to processing.", event: "harvest_cassava", target: 3, xpReward: 50, repeatable: false, district: "Farm" },
  { id: "garri-maker", title: "Make Your First Garri", description: "Process harvested cassava into garri.", culturalNote: "Garri production includes peeling, washing, grating, dewatering, sieving and frying.", event: "process_garri", target: 1, xpReward: 75, repeatable: false, district: "Processing" },
  { id: "market-day", title: "Take Garri to Market", description: "Complete one delivery to the Garri Market.", culturalNote: "Local markets connect farmers, processors, traders and households.", event: "deliver_garri", target: 1, xpReward: 60, repeatable: false, district: "Market" },
  { id: "community-roots", title: "Meet the GARRI Community", description: "Visit an official GARRI community destination.", culturalNote: "The farming world connects to the wider GARRI community.", event: "community_join", target: 1, xpReward: 15, repeatable: false, district: "Community" },
] as const;

export function getQuestById(id: string): QuestDefinition | undefined {
  return QUESTS.find((quest) => quest.id === id);
}
