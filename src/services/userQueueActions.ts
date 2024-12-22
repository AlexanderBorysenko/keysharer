const userPromiseChain = new Map();
function queueUserAction(userId: string, action: () => Promise<any>) {
    // If no existing chain, initialize with a resolved promise.
    if (!userPromiseChain.has(userId)) {
        userPromiseChain.set(userId, Promise.resolve());
    }

    // Get the last promise chain for the user
    const chain = userPromiseChain.get(userId);

    // Chain the new action
    const newChain = chain.then(action);

    // Update the chain in the Map
    userPromiseChain.set(userId, newChain);

    // Return the new chain in case you want to .then() on it
    return newChain;
}

export default queueUserAction;