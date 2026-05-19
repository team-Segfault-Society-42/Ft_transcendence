export interface LevelUtils {
    currentLevel: number,
    nextLevel: number,
    currentXp: number,
    neededXp: number,
    percent: number,
}

export function xpForLevel(level: number): number {
	let result = Math.floor(100 * Math.pow(level, 1.5));
	return result;
}

export function getLevel(xp: number): number {
    let level = 0

    while (xpForLevel(level + 1) <= xp) {
        level++
    }
    return level
}

export function getLevelProgress(xp: number): LevelUtils {
    const currentLevel = getLevel(xp)
    const nextLevel = currentLevel + 1
    const currentXp = xp - xpForLevel(currentLevel)
    const neededXp = xpForLevel(nextLevel) - xpForLevel(currentLevel)
    const percent = (currentXp / neededXp) * 100

    return {
        currentLevel,
        nextLevel,
        currentXp,
        neededXp,
        percent
    }
}