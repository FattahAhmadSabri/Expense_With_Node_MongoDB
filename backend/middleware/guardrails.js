const BANNED_KEYWORDS = ['hack', 'exploit', 'bypass', 'illegal', 'weapons'];

function inputGuardrail(req, res, next) {
    const userInput = req.body.description || req.body.message;

    if (!userInput) {
        return res.status(400).json({ error: "Prompt is required." });
    }

    const containsBannedWord = BANNED_KEYWORDS.some(word => 
        userInput.toLowerCase().includes(word)
    );

    if (containsBannedWord) {
        return res.status(400).json({ 
            error: "Safety Block: Your request contains prohibited language or topics." 
        });
    }
    next();
}

module.exports = { inputGuardrail };