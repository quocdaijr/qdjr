// The channels between the /about page and the layout-level VibeScene.
// progress: 0 on /, i / (stops − 1) while a journey stop is centred on /about.
export const useJourneyProgress = () => useState<number>('journey-progress', () => 0)

// stop: index of the centred /about stop, or null when no journey page is
// mounted (lets a scene tell the home page from the first journey stop).
export const useJourneyStop = () => useState<number | null>('journey-stop', () => null)
