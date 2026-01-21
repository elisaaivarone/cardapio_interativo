import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  Box, Typography, Button, TextField, Paper, Tabs, Tab, 
  MenuItem, Select, FormControl, InputLabel, IconButton, 
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Divider, Avatar
} from '@mui/material';
// Ícones
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useNavigate } from 'react-router-dom';
import { updateProfileImage } from '../../services/api';
import AppSidebar from '../../components/AppSidebar/AppSidebar';
import { 
    getTeam, inviteMember, deleteMember, 
    updateProfile, changePassword, updateEmail 
} from '../../services/api';

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0); 
  const fileInputRef = useRef(null);

  // Estados dos Formulários
  const [teamList, setTeamList] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('hall');
  const [inviteResult, setInviteResult] = useState(null);
  const [openInviteModal, setOpenInviteModal] = useState(false);

  const [profileData, setProfileData] = useState({ name: '', whatsapp: '' });
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
  const [emailData, setEmailData] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
        setUser(userData);
        setProfileData({ name: userData.name || '', whatsapp: userData.whatsapp || '' });
        setEmailData(userData.email || '');
    }
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try { const data = await getTeam(); setTeamList(data); } catch (error) { console.error(error); }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return toast.warning('Digite um e-mail.');
    try {
      const data = await inviteMember(inviteEmail, inviteRole);
      setInviteResult(data);
      setOpenInviteModal(true);
      setInviteEmail('');
      toast.success('Convite gerado!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro.');
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('Remover este usuário?')) {
        try { await deleteMember(id); toast.success('Removido.'); fetchTeam(); } 
        catch (error) { toast.error('Erro ao remover.', error); }
    }
  };

  const handleUpdateProfile = async () => {
      try {
          const updatedUser = await updateProfile(user.id, profileData);
          const newUser = { ...user, ...updatedUser };
          localStorage.setItem('user', JSON.stringify(newUser));
          setUser(newUser);
          toast.success('Perfil atualizado!');
      } catch (error) { toast.error('Erro ao atualizar perfil.', error); }
  };

  const handleChangePassword = async () => {
      if (passData.new !== passData.confirm) return toast.warning('Senhas não coincidem.');
      try {
          await changePassword(user.id, passData.current, passData.new);
          toast.success('Senha alterada!');
          setPassData({ current: '', new: '', confirm: '' });
      } catch (error) { toast.error(error.response?.data?.error || 'Erro.'); }
  };

  const handleUpdateEmail = async () => {
      try {
          const updatedUser = await updateEmail(user.id, emailData);
          const newUser = { ...user, email: updatedUser.email };
          localStorage.setItem('user', JSON.stringify(newUser));
          setUser(newUser);
          toast.success('E-mail atualizado!');
      } catch (error) { toast.error(error.response?.data?.error || 'Erro.'); }
  };

  const copyLink = () => {
      if (inviteResult?.link) {
          navigator.clipboard.writeText(inviteResult.link);
          toast.info('Link copiado!');
      }
  };

  const getRoleLabel = (role) => {
      if (role === 'admin') return 'Admin';
      if (role === 'hall') return 'Garçom';
      if (role === 'kitchen') return 'Cozinha';
      return role;
  };

  // Lógica de Voltar
  const handleGoBack = () => {
    const role = user?.role ? user.role.toLowerCase() : '';
    if (role === 'hall') navigate('/order');      
    else if (role === 'kitchen') navigate('/kitchen'); 
    else navigate('/dashboard');                  
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const data = await updateProfileImage(user.id, file);
        
        // Atualiza a imagem na tela imediatamente
        const updatedUser = { ...user, imageUrl: data.imageUrl };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast.success('Foto atualizada com sucesso!');
    } catch (error) {
        toast.error('Erro ao enviar imagem.');
        console.error(error);
    }
  };

  return (
    <AppSidebar user={user} onLogout={() => {localStorage.clear(); window.location.href='/login'}}>
      <Box sx={{ p: 3, maxWidth: '1000px', margin: '0 auto' }}>
        {/* --- NOVO BOTÃO VOLTAR --- */}
        <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleGoBack}
            sx={{ mb: 2, color: '#666', textTransform: 'none' }}
        >
            Voltar
        </Button>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{color:'#111'}}>Configurações</Typography>
        <Typography variant="body2" color="text.secondary" paragraph sx={{mb:3}}>
            Gerencie as informações do seu time.
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} textColor="inherit" indicatorColor="primary" 
                sx={{ '& .Mui-selected': { fontWeight: 'bold', color: 'black !important' } }}>
                <Tab label="Perfil" sx={{ textTransform: 'none' }} />
                <Tab label="Senha" sx={{ textTransform: 'none' }} />
                <Tab label="Email" sx={{ textTransform: 'none' }} />
                {isAdmin && <Tab label="Equipe" sx={{ textTransform: 'none' }} />}
            </Tabs>
        </Box>

        {/* === PERFIL === */}
        {activeTab === 0 && (
            <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Usuário</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>Atualize seus dados pessoais</Typography>
                
                <Paper elevation={0} sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="caption" color="text.secondary" mb={0.5} display="block">Nome Completo</Typography>
                            <TextField fullWidth size="small" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="caption" color="text.secondary" mb={0.5} display="block">WhatsApp</Typography>
                            <TextField fullWidth size="small" placeholder="(00) 00000-0000" value={profileData.whatsapp} onChange={e => setProfileData({...profileData, whatsapp: e.target.value})} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary" mb={0.5} display="block">Email address</Typography>
                            <TextField fullWidth size="small" value={user?.email} disabled sx={{ bgcolor: '#f9f9f9' }} />
                        </Grid>
                        <Grid item xs={12}>
                        {/* Input Invisível */}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                accept="image/*"
                                onChange={handleFileChange} 
                            />
        
                            <Button 
                                variant="outlined" 
                                fullWidth 
                                sx={{ 
                                    height: 120, 
                                    borderStyle: 'dashed', 
                                    color: 'text.primary', 
                                    borderColor: '#ccc', 
                                    textTransform:'none', 
                                    flexDirection:'column' 
                                }}
                                onClick={() => fileInputRef.current.click()} 
                            >       
                                {user?.imageUrl ? (
                                    <Avatar src={user.imageUrl} sx={{ width: 80, height: 80, mb: 1 }} />
                                ) : (
                                    <CloudUploadIcon sx={{fontSize: 40, color:'#ccc', mb:1}}/>
                                )}
                                <Typography fontWeight="bold">Clique Para Atualizar A Imagem</Typography>
                            </Button>
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" color="inherit" sx={{textTransform:'none'}}>Cancelar</Button>
                        <Button variant="contained" sx={{ bgcolor: 'main.light', textTransform:'none', fontWeight:'bold', '&:hover':{bgcolor:'main.dark'} }} onClick={handleUpdateProfile}>Salvar Alterações</Button>
                    </Box>
                </Paper>
            </Box>
        )}

        {/* === SENHA === */}
        {activeTab === 1 && (
            <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Senha</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>Por favor, informe sua senha atual e a nova senha.</Typography>
                <Paper elevation={0} sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 2, maxWidth: 700 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" mb={0.5} display="block">Senha Atual</Typography>
                        <TextField type="password" fullWidth size="small" placeholder="********" value={passData.current} onChange={e => setPassData({...passData, current: e.target.value})} />
                    </Box>
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" mb={0.5} display="block">Nova Senha</Typography>
                        <TextField type="password" fullWidth size="small" placeholder="********" value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} />
                    </Box>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" color="text.secondary" mb={0.5} display="block">Confirmar Nova Senha</Typography>
                        <TextField type="password" fullWidth size="small" placeholder="********" value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" color="inherit" sx={{textTransform:'none'}}>Cancelar</Button>
                        <Button variant="contained" sx={{ bgcolor: 'main.light', textTransform:'none', fontWeight:'bold', '&:hover':{bgcolor:'main.dark'} }} onClick={handleChangePassword}>Atualizar</Button>
                    </Box>
                </Paper>
            </Box>
        )}

        {/* === EMAIL === */}
        {activeTab === 2 && (
            <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Email</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>Pressione um botão "alterar e-mail" para atualizar.</Typography>
                <Paper elevation={0} sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" mb={0.5} display="block">Seu E-mail Atual</Typography>
                    <TextField fullWidth size="small" value={emailData} onChange={e => setEmailData(e.target.value)} sx={{ mb: 3 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" sx={{ bgcolor: 'main.light', textTransform:'none', fontWeight:'bold', '&:hover':{bgcolor:'main.dark'} }} onClick={handleUpdateEmail}>Alterar E-mail</Button>
                    </Box>
                </Paper>
            </Box>
        )}

        {/* === EQUIPE === */}
        {isAdmin && activeTab === 3 && (
            <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Convide sua Equipe</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>Convide outros membros para participar.</Typography>
                
                <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <TextField 
                            placeholder="you@example.com" size="small" sx={{ flexGrow: 1, minWidth: 200 }} 
                            value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                            InputProps={{ startAdornment: <Typography color="text.secondary" sx={{mr:1}}>✉️</Typography> }}
                        />
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <Select value={inviteRole} onChange={e => setInviteRole(e.target.value)} displayEmpty>
                                <MenuItem value="hall">Garçom</MenuItem>
                                <MenuItem value="kitchen">Cozinha</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                        </FormControl>
                        <Button variant="contained" sx={{ bgcolor: 'main.light', textTransform:'none', fontWeight:'bold', '&:hover':{bgcolor:'main.dark'} }} onClick={handleInvite}>Convidar Membro</Button>
                    </Box>
                </Paper>

                <Typography variant="h6" fontWeight="bold" gutterBottom>Membros</Typography>
                <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow:'hidden' }}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#fff' }}>
                                <TableRow>
                                    <TableCell><strong>Nome</strong></TableCell>
                                    <TableCell><strong>Nível</strong></TableCell>
                                    <TableCell align="right"></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {teamList.map((m) => (
                                    <TableRow key={m._id} hover>
                                        <TableCell>{m.name} <br/><Typography variant="caption" color="text.secondary">{m.email}</Typography></TableCell>
                                        <TableCell>{getRoleLabel(m.role)}</TableCell>
                                        <TableCell align="right">
                                            {user?.id !== m._id && (
                                                <IconButton color="error" size="small" onClick={() => handleDeleteMember(m._id)}><DeleteIcon /></IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>
        )}

        {/* MODAL CONVITE */}
        <Dialog open={openInviteModal} onClose={() => setOpenInviteModal(false)} fullWidth maxWidth="sm">
            <DialogTitle>Convite Gerado</DialogTitle>
            <DialogContent>
                <Typography gutterBottom>Copie o link abaixo:</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{inviteResult?.link}</Typography>
                    <IconButton onClick={copyLink}><ContentCopyIcon /></IconButton>
                </Paper>
            </DialogContent>
            <DialogActions><Button onClick={() => setOpenInviteModal(false)}>Fechar</Button></DialogActions>
        </Dialog>

      </Box>
    </AppSidebar>
  );
};

export default Settings;