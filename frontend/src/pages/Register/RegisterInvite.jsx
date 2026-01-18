import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Chip,
} from "@mui/material";

// Ícones
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import logo from "../../assets/burger-queen-logo.png";
import { validateInviteToken, registerWithInvite } from "../../services/api";

const RegisterInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [error, setError] = useState("");

  // Formulário
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState(""); // <--- NOVO ESTADO

  useEffect(() => {
    if (!token) {
      setError("Link de convite inválido (sem código).");
      setLoading(false);
      return;
    }

    const checkToken = async () => {
      try {
        const data = await validateInviteToken(token);
        setInviteData(data);
      } catch (err) {
        setError("Este convite é inválido ou já expirou.", err);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword)
      return toast.error("As senhas não coincidem.");
    if (password.length < 6) return toast.error("Senha muito curta.");

    try {
      await registerWithInvite({
        token,
        name,
        password,
        whatsapp,
      });

      toast.success("Conta criada! Faça login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Erro ao criar conta.");
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Ooops!
          </Typography>
          <Typography paragraph>{error}</Typography>
          <Button variant="contained" onClick={() => navigate("/login")}>
            Ir para Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img src={logo} alt="Logo" style={{ width: 150, marginBottom: 20 }} />

        <Paper elevation={3} sx={{ p: 4, width: "100%", borderRadius: 2 }}>
          <Typography
            component="h1"
            variant="h5"
            align="center"
            fontWeight="bold"
            gutterBottom
          >
            Bem-vindo ao Time!
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Complete seu cadastro para acessar.
          </Typography>

          {/* Dados Travados do Convite */}
          <Box
            sx={{
              bgcolor: "#fff4e5",
              p: 2,
              borderRadius: 1,
              mb: 3,
              border: "1px solid #ffcc80",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Você foi convidado como:
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
            >
              <PersonIcon
                fontSize="small"
                color="primary"
                sx={{ color: "#ed6c02" }}
              />
              <Typography fontWeight="bold">{inviteData.email}</Typography>
            </Box>
            <Chip
              label={
                inviteData.role === "admin"
                  ? "Administrador"
                  : inviteData.role === "hall"
                  ? "Garçom"
                  : "Cozinha"
              }
              size="small"
              sx={{
                mt: 1,
                bgcolor: "#ed6c02",
                color: "white",
                fontWeight: "bold",
              }}
            />
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Seu Nome Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="Ex: João da Silva"
            />
            <TextField
              margin="normal"
              fullWidth
              label="Seu WhatsApp"
              placeholder="(00) 00000-0000"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <WhatsAppIcon color="action" sx={{ mr: 1, opacity: 0.6 }} />
                  ),
                  autoComplete: "off", 
                  name: "whatsapp_field_random", // Nome aleatório para confundir o navegador
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Crie sua Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirme a Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 3,
                mb: 2,
                bgcolor: "#ed6c02",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#e65100" },
              }}
              startIcon={<CheckCircleIcon />}
            >
              ATIVAR MINHA CONTA
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterInvite;
