const userPromiseChain = new Map();

function queueUserAction(userId: string, action: () => Promise<any>) {
    // Якщо немає ланцюжка для цього користувача, створюємо "порожній" Promise
    if (!userPromiseChain.has(userId)) {
        userPromiseChain.set(userId, Promise.resolve());
    }

    // Забираємо поточний ланцюжок для користувача
    const chain = userPromiseChain.get(userId);

    // Додаємо нашу дію до ланцюжка
    const newChain = chain
        .then(() => action())
        .finally(() => {
            // Якщо в Map досі зберігається саме цей ланцюжок (не з’явилися нові)
            // — видаляємо запис, щоб він не займав пам’ять
            if (userPromiseChain.get(userId) === newChain) {
                userPromiseChain.delete(userId);
            }
        });

    // Оновлюємо ланцюжок у Map
    userPromiseChain.set(userId, newChain);

    console.log('User promise chain:', newChain);
    return newChain;
}

export default queueUserAction;
