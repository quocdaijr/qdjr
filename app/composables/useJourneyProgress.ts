// The one channel between the /about page and the layout-level VibeScene:
// 0 on /, i / (stops − 1) while a journey stop is centred on /about.
export const useJourneyProgress = () => useState<number>('journey-progress', () => 0)
