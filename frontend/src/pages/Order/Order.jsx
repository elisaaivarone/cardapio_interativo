import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// --- IMPORTAÇÕES DO MUI ---
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Drawer from "@mui/material/Drawer";
import Badge from "@mui/material/Badge";
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
// Ícones
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import CoffeeIcon from "@mui/icons-material/Coffee";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
// Serviços e Componentes
import {
  getItems,
  createOrder,
  getOrders,
  updateOrderStatus,
  processPayment,
} from "../../services/api";
import ProductModal from "../../components/ProductModal/ProductModal";
import AppSidebar from "../../components/AppSidebar/AppSidebar";
import PaymentModal from "../../components/PaymentModal/PaymentModal";
import PaidIcon from "@mui/icons-material/Paid";

function Order() {
  const navigate = useNavigate();

  // --- Estados ---
  const [menuType, setMenuType] = useState("allDay");
  const [currentOrder, setCurrentOrder] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [breakfastItems, setBreakfastItems] = useState([]);
  const [allDayItems, setAllDayItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sendingOrder, setSendingOrder] = useState(false);
  const [activeTab, setActiveTab] = useState("current");
  const [readyOrders, setReadyOrders] = useState([]);
  const [loadingReadyOrders, setLoadingReadyOrders] = useState(false);
  const [errorReadyOrders, setErrorReadyOrders] = useState("");
  const [orderType, setOrderType] = useState("dineIn"); // 'dineIn' ou 'delivery'
  const [tableNumber, setTableNumber] = useState("");

  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [orderToPay, setOrderToPay] = useState(null);

  // Busca Menus
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoadingMenu(true);
        const [breakfastData, allDayData] = await Promise.all([
          getItems({ menu: "breakfast" }),
          getItems({ menu: "allDay" }),
        ]);
        setBreakfastItems(breakfastData);
        setAllDayItems(allDayData);
      } catch (error) {
        console.error("Erro ao buscar menus:", error);
        toast.error("Erro ao carregar os menus.");
      } finally {
        setLoadingMenu(false);
      }
    };
    fetchMenus();
  }, []);

  // Busca Pedidos Prontos
  useEffect(() => {
    const fetchReadyOrders = async () => {
      try {
        setLoadingReadyOrders(true);
        const orders = await getOrders("ready,delivered");
        setReadyOrders(orders);
        setErrorReadyOrders("");
      } catch (error) {
        console.error(
          "Erro ao buscar pedidos prontos em segundo plano:",
          error
        );
      }
    };

    fetchReadyOrders();

    const intervalId = setInterval(fetchReadyOrders, 10000);

    return () => clearInterval(intervalId);
  }, []);

  // Busca Usuário
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      setUser(userData);
    } catch (e) {
      console.error("Erro ao ler usuário", e);
    }
  }, []);

  // --- Funções Handler ---

  //  Alterna o Drawer (Mobile)
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  // Adiciona Item ao Pedido
  const handleAddItem = (item) => {
    const needsCustomization =
      (item.category === "Lanches" && item.menu === "allDay") ||
      item.category === "Acompanhamentos";
    if (needsCustomization) {
      setSelectedItem(item);
      setIsModalOpen(true);
    } else {
      handleAddToCart({ ...item, orderItemId: Date.now() });
    }
  };

  // Adiciona Item ao Carrinho
  const handleAddToCart = (itemToAdd) => {
    const existingItem = currentOrder.find(
      (item) => item.name === itemToAdd.name
    );
    if (existingItem) {
      setCurrentOrder(
        currentOrder.map((item) =>
          item.name === itemToAdd.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCurrentOrder([...currentOrder, { ...itemToAdd, quantity: 1 }]);
    }
  };

  // Remove Item do Carrinho
  const handleRemoveItem = (nameToRemove) => {
    setCurrentOrder(currentOrder.filter((item) => item.name !== nameToRemove));
  };

  // Diminui Quantidade do Item no Carrinho
  const handleDecreaseQuantity = (nameToDecrease) => {
    const existingItem = currentOrder.find(
      (item) => item.name === nameToDecrease
    );
    if (existingItem.quantity === 1) {
      handleRemoveItem(nameToDecrease);
    } else {
      setCurrentOrder(
        currentOrder.map((item) =>
          item.name === nameToDecrease
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    }
  };
  // Aumenta Quantidade do Item no Carrinho
  const handleIncreaseQuantity = (nameToIncrease) => {
    setCurrentOrder(
      currentOrder.map((item) =>
        item.name === nameToIncrease
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };
  // Envia Pedido
  const handleSendOrder = async () => {
    if (currentOrder.length === 0) {
      toast.warn("O pedido está vazio!");
      return;
    }
    if (orderType === "dineIn" && !tableNumber) {
      toast.warn("Por favor, informe o número da Mesa.");
      return;
    }
    if (orderType === "delivery" && !customerName) {
      toast.warn("Por favor, informe o Nome do Cliente.");
      return;
    }
    setSendingOrder(true);
    const orderData = {
      orderType, // 'dineIn' ou 'delivery'
      tableNumber: orderType === "dineIn" ? tableNumber : "",
      clientName:
        orderType === "delivery" ? customerName : `Mesa ${tableNumber}`,
      items: currentOrder.map((item) => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalPrice: total,
    };
    try {
      await createOrder(orderData);
      toast.success(`Pedido para ${orderData.clientName} enviado!`);
      setCurrentOrder([]);
      setCustomerName("");
      setMobileOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar pedido.");
    } finally {
      setSendingOrder(false);
    }
  };

  // Logout é tratado pelo AppSidebar, mas precisamos passá-lo
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleMarkAsDelivered = async (orderId) => {
    try {
        await updateOrderStatus(orderId, 'delivered');
        setReadyOrders((prevOrders) => 
            prevOrders.map((order) => 
                order._id === orderId 
                    ? { ...order, status: 'delivered' } // Muda só o status
                    : order // Mantém os outros iguais
            )
        );
      toast.info("Entregue!");
    } catch (error) {
        console.error("Erro ao entregar:", error);
        toast.error("Erro ao atualizar status.");
    }
};

  // Abre Modal de Pagamento
  const handleOpenPayment = (order) => {
    setOrderToPay(order);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async (orderId, paymentData) => {
    try {
      await processPayment(orderId, paymentData);
      toast.success("Pagamento registrado com sucesso!");

      setReadyOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar pagamento.");
    }
  };

  const menuToDisplay = menuType === "breakfast" ? breakfastItems : allDayItems;
  const total = currentOrder.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // --- CONTEÚDO DA COLUNA DIREITA (Resumo) ---
  const OrderSummaryContent = (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.rightMenu",
        color: "white",
        overflow: "hidden",
      }}
    >
      {/* Cabeçalho da Aba (Fixo) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
          p: 2,
          pb: 0,
          flexShrink: 0,
        }}
      >
        <IconButton
          onClick={handleDrawerToggle}
          sx={{ display: { md: "none" }, color: "white" }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          borderBottom: 1,
          borderColor: "grey.700",
          mb: 2,
          mx: 2,
          flexShrink: 0,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
          textColor="primary"
          indicatorColor="primary"
          variant="fullWidth"
        >
          <Tab
            label="Pedido Atual"
            value="current"
            icon={<ReceiptLongIcon />}
            iconPosition="start"
            sx={{
              minWidth: "50%",
              color: "white",
              "&.Mui-selected": { color: "primary.light" },
            }}
          />
          <Tab
            label={
              <Badge
                badgeContent={
                  readyOrders.filter((o) => o.status === "ready").length
                }
                color="error"
              >
                <span style={{ paddingRight: "8px" }}>Prontos</span>
              </Badge>
            }
            value="ready"
            icon={<CheckCircleOutlineIcon />}
            iconPosition="start"
            sx={{
              minWidth: "50%",
              color: "white",
              "&.Mui-selected": { color: "primary.main" },
            }}
          />
        </Tabs>
      </Box>

      {/* Área de Conteúdo (Cresce e Rola) */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          px: 2,
        }}
      >
        {activeTab === "current" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "hidden",
            }}
          >
            <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
              <ToggleButtonGroup
                value={orderType}
                exclusive
                onChange={(e, newType) => {
                  if (newType) setOrderType(newType);
                }}
                aria-label="tipo de pedido"
                size="small"
                fullWidth
                sx={{ bgcolor: "grey.800" }}
              >
                <ToggleButton
                  value="dineIn"
                  sx={{
                    color: "white",
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "white",
                    },
                  }}
                >
                  <RestaurantIcon sx={{ mr: 1 }} /> Mesa
                </ToggleButton>
                <ToggleButton
                  value="delivery"
                  sx={{
                    color: "white",
                    "&.Mui-selected": {
                      bgcolor: "secondary.main",
                      color: "white",
                    },
                  }}
                >
                  <TwoWheelerIcon sx={{ mr: 1 }} /> Delivery
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* 2. Input Dinâmico (Muda dependendo da escolha) */}
            {orderType === "dineIn" ? (
              <TextField
                label="Número da Mesa"
                variant="filled"
                size="small"
                type="number" 
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                fullWidth
                autoFocus
                sx={{
                  mb: 1.5,
                  bgcolor: "secondary.contrastText",
                  borderRadius: 1,
                  "& .MuiInputBase-input": {
                    color: "primary.contrastText2",
                    fontSize: "1rem",
                    fontWeight: "bold",
                  },
                  "& label": { color: "grey.600" },
                }}
              />
            ) : (
              <TextField
                label="Nome do Cliente"
                variant="filled"
                size="small"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                fullWidth
                autoFocus
                sx={{
                  mb: 1.5,
                  bgcolor: "secondary.contrastText",
                  borderRadius: 1,
                  "& .MuiInputBase-input": { 
                    color: "primary.contrastText2" },
                    fontSize: "1rem",
                    fontWeight: "bold",
                  "& label": { color: "grey.600" },
                }}
              />
            )}

            <List sx={{ flexGrow: 1, overflowY: "auto", mb: 1.5, p: 0 }}>
              {currentOrder.length === 0 ? (
                <Typography
                  sx={{ textAlign: "center", color: "grey.500", mt: 2 }}
                >
                  Vazio.
                </Typography>
              ) : (
                currentOrder.map((item) => (
                  <ListItem
                    key={item.name}
                    disablePadding
                    sx={{
                      borderBottom: "1px solid #424242",
                      pt: 1,
                      pb: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          overflow: "hidden",
                        }}
                      >
                        <ListItemAvatar sx={{ minWidth: 40 }}>
                          {" "}
                          <Avatar
                            variant="rounded"
                            src={item.imageUrl}
                            alt={item.name}
                            sx={{ width: 35, height: 35 }}
                          />{" "}
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.name}
                          secondary={`R$ ${(item.price * item.quantity).toFixed(
                            2
                          )}`}
                          primaryTypographyProps={{
                            sx: {
                              color: "white",
                              fontSize: "0.85rem",
                              fontWeight: 500,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "140px",
                            },
                          }}
                          secondaryTypographyProps={{
                            sx: {
                              color: "primary.light",
                              fontSize: "0.8rem",
                              fontWeight: "bold",
                            },
                          }}
                        />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveItem(item.name)}
                        sx={{ color: "error.main", p: 0.5 }}
                      >
                        {" "}
                        <DeleteIcon fontSize="small" />{" "}
                      </IconButton>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        ml: "40px",
                        mt: 0.5,
                        width: "calc(100% - 40px)",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          bgcolor: "grey.800",
                          borderRadius: 5,
                        }}
                      >
                        <IconButton
                          size="small"
                          sx={{ color: "white", p: 0.5 }}
                          onClick={() => handleDecreaseQuantity(item.name)}
                        >
                          {" "}
                          <RemoveCircleOutlineIcon fontSize="small" />{" "}
                        </IconButton>
                        <Typography
                          sx={{
                            color: "white",
                            fontWeight: "bold",
                            minWidth: "20px",
                            textAlign: "center",
                            fontSize: "0.9rem",
                          }}
                        >
                          {" "}
                          {item.quantity}{" "}
                        </Typography>
                        <IconButton
                          size="small"
                          sx={{ color: "white", p: 0.5 }}
                          onClick={() => handleIncreaseQuantity(item.name)}
                        >
                          {" "}
                          <AddCircleOutlineIcon fontSize="small" />{" "}
                        </IconButton>
                      </Box>
                    </Box>
                  </ListItem>
                ))
              )}
            </List>

            <Box
              sx={{
                mt: "auto",
                pt: 1.5,
                borderTop: "1px solid grey.700",
                flexShrink: 0,
                pb: 2,
              }}
            >
              <Typography
                variant="h6"
                component="p"
                sx={{ textAlign: "right", mb: 1.5 }}
              >
                {" "}
                Total: R$ {total.toFixed(2)}{" "}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<SendIcon />}
                onClick={handleSendOrder}
                disabled={sendingOrder}
                sx={{
                  p: 1.2,
                  fontSize: "1rem",
                  fontWeight: "bold",
                  bgcolor: "primary.main",
                  color: "secondary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                {sendingOrder ? "Enviando..." : "Enviar"}
              </Button>
            </Box>
          </Box>
        )}

        {activeTab === "ready" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "hidden",
            }}
          >
            {!loadingReadyOrders &&
            readyOrders.length === 0 &&
            !errorReadyOrders ? (
              <Typography
                sx={{ textAlign: "center", color: "grey.500", mt: 2 }}
              >
                Vazio.
              </Typography>
            ) : (
              <List sx={{ flexGrow: 1, overflowY: "auto", p: 0 }}>
                {readyOrders.map((order) => (
                  <ListItem
                    key={order._id}
                    sx={{
                      bgcolor: "grey.800",
                      mb: 1,
                      borderRadius: 1,
                      flexDirection: "column",
                      alignItems: "flex-start",
                      p: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: "white" }}>
                      {order.clientName}{" "}
                      <span style={{ color: "#aaa" }}>
                        #{order._id.slice(-4)}
                      </span>
                    </Typography>
                    <List disablePadding sx={{ pl: 0, width: "100%" }}>
                      {order.items.map((item, idx) => (
                        <ListItemText
                          key={idx}
                          primary={`- ${item.name} (x${item.quantity})`}
                          sx={{ m: 0 }}
                          primaryTypographyProps={{
                            fontSize: "0.8rem",
                            color: "grey.300",
                          }}
                        />
                      ))}
                    </List>
                    <Box sx={{ display: "flex", gap: 1, width: "100%", mt: 1 }}>
                      {/* Botão Entregue */}
                      <Button
                        variant={
                          order.status === "delivered" ? "text" : "outlined"
                        }
                        size="small"
                        color="info"
                        disabled={order.status === "delivered"}
                        onClick={() => handleMarkAsDelivered(order._id)}
                        sx={{ flex: 1 }}
                      >
                        Entregue
                      </Button>

                      {/* BOTÃO PAGAR */}
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        startIcon={<PaidIcon />}
                        onClick={() => handleOpenPayment(order)}
                        sx={{ flex: 1 }}
                      >
                        Pagar
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );

  // --- BOTÃO CARRINHO (Telas Pequenas)---
  const cartButton = (
    <IconButton color="inherit" onClick={handleDrawerToggle} sx={{ ml: 1 }}>
      <Badge badgeContent={currentOrder.length} color="secondary">
        <ShoppingCartIcon />
      </Badge>
    </IconButton>
  );

  return (
    <AppSidebar
      user={user}
      onLogout={handleLogout}
      actionButton={cartButton}
      hideDesktopAction={true}
    >
      <Box
        sx={{
          display: "flex",
          height: "100%",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* === COLUNA CENTRAL (PRODUTOS) === */}
        <Box sx={{ flexGrow: 1, p: 2, overflowY: "auto", bgcolor: "#f4f6f8" }}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              mb: 2,
              bgcolor: "background.paper",
              borderRadius: 1,
            }}
          >
            <Tabs
              value={menuType}
              onChange={(event, newValue) => setMenuType(newValue)}
              aria-label="menu tabs"
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab
                label="Almoço"
                value="allDay"
                icon={<FastfoodIcon />}
                iconPosition="start"
              />
              <Tab
                label="Café"
                value="breakfast"
                icon={<CoffeeIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {loadingMenu ? (
            <Typography sx={{ textAlign: "center", mt: 4 }}>
              Carregando...
            </Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                "@media (min-width: 1536px)": {
                  gridTemplateColumns: "repeat(5, 1fr)",
                },
                "@media (min-width: 1200px) and (max-width: 1535px)": {
                  gridTemplateColumns: "repeat(4, 1fr)",
                },
                gap: 2,
              }}
            >
              {menuToDisplay.map((item) => (
                <Card
                  key={item._id}
                  sx={{
                    height: "280px",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    boxShadow: 2,
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.02)" },
                  }}
                >
                  <CardActionArea
                    onClick={() => handleAddItem(item)}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flexGrow: 1,
                      height: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        height: 130,
                        width: "100%",
                        p: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      <CardMedia
                        component="img"
                        sx={{
                          maxHeight: "100%",
                          width: "auto",
                          maxWidth: "100%",
                          objectFit: "contain",
                          borderRadius: 2,
                        }}
                        image={
                          item.imageUrl ||
                          "https://via.placeholder.com/200x130?text=Sem+Imagem"
                        }
                        alt={item.name}
                      />
                    </Box>
                    <CardContent
                      sx={{
                        width: "100%",
                        textAlign: "center",
                        p: 1,
                        pt: 0.5,
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        component="div"
                        sx={{
                          fontWeight: 600,
                          lineHeight: 1.3,
                          height: "3em",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          mb: 0.5,
                          wordBreak: "break-word",
                          textAlign: "center",
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="primary.main"
                        sx={{ fontWeight: "bold", mt: "auto", flexShrink: 0 }}
                      >
                        R$ {item.price.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          )}
        </Box>

        {/* === COLUNA DIREITA (SIDEBAR - Apenas Desktop) === */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            width: 360,
            flexShrink: 0,
          }}
        >
          {OrderSummaryContent}
        </Box>
      </Box>

      {/* === DRAWER (CARRINHO - Apenas Mobile) === */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 320,
            bgcolor: "#303030",
          },
        }}
      >
        {OrderSummaryContent}
      </Drawer>

      {/* Modal de Customização */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedItem}
        onAddToCart={handleAddToCart}
      />

      {/* Modal de Pagamento */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        order={orderToPay}
        onConfirmPayment={handleConfirmPayment}
      />
    </AppSidebar>
  );
}

export default Order;
