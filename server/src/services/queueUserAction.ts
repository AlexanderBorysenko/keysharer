const userPromiseChain = new Map();

function queueUserAction(userId: string, action: () => Promise<any>) {
    // Якщо немає ланцюжка для цього користувача, створюємо "порожній" Promise
    if (!userPromiseChain.has(userId)) {
        userPromiseChain.set(userId, Promise.resolve());
    }

    // Забираємо поточний ланцюжок для користувача
    const chain = userPromiseChain.get(userId);

    // Додаємо нашу дію до ланцюжка. `.catch()` тут обов'язковий: без нього відхилення
    // (rejection) однієї дії "отруює" ланцюжок назавжди — .then() на відхиленому
    // проміс пропускає обробник, тож усі наступні дії для цього користувача, що вже
    // додані до Map, ніколи не виконаються. Ловимо й логуємо помилку тут, щоб і сам
    // виклик не залишав необроблений (unhandled) reject.
    const newChain = chain
        .then(() => action())
        .catch((error: unknown) => {
            console.error(`queueUserAction: action failed for user ${userId}:`, error);
        })
        .finally(() => {
            // Якщо в Map досі зберігається саме цей ланцюжок (не з’явилися нові)
            // — видаляємо запис, щоб він не займав пам’ять
            if (userPromiseChain.get(userId) === newChain) {
                userPromiseChain.delete(userId);
            }
        });

    // Оновлюємо ланцюжок у Map
    userPromiseChain.set(userId, newChain);

    return newChain;
}

export default queueUserAction;
