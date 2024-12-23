const usersOnlinePingPongIterationIdsStorage = new Map<string, string>();
const usersOnlinePingPongIterationIntervalsStorage = new Map<string, ReturnType<typeof setInterval>>();

export { usersOnlinePingPongIterationIdsStorage, usersOnlinePingPongIterationIntervalsStorage };