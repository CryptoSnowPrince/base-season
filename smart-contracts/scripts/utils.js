function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendTransaction(account, to, value) {
    const tx = await account.sendTransaction({ to, value })
    const ret = await tx.wait()
    console.log("tx ret: ", ret.hash)
}

module.exports = {
    delay,
    sendTransaction
}