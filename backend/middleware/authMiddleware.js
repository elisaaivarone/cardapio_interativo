const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    // 1. Pega o token do cabeçalho da requisição
    const authHeader = req.header('Authorization');

    // 2. Se não houver cabeçalho, recusa o acesso
    if (!authHeader) {
        return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }
    // O token vem no formato "Bearer <token>", então separamos
    const token = authHeader.split(' ')[1];
    // 3. Se não houver token após "Bearer", recusa o acesso
    if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Formato de token inválido.' });
  }
    try {
        // 4. Verifica se o token é válido
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Armazena os dados do usuário na requisição
        next(); // Continua para a próxima estapa
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido.' });
    }
}

module.exports = authMiddleware;