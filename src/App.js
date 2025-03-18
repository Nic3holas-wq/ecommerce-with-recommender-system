import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home/Home";
import Contact from "./Components/Contact/Contact";
import Cart from "./Components/Cart/Cart";
import Products from "./Components/Products/Products";
import ProductInfo from "./Components/ProductInfo/ProductInfo";
import Login from "./Components/Login/Login";
import Account from "./Components/Account/Account";
import Payment from "./Components/Payment/Payment";
import OrderStatus from "./Components/OrderStatus/OrderStatus";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/account" element={<Account/>} />
        <Route path="/home" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/products" element={<Products />} />
        <Route path="/productinfo/:id" element={<ProductInfo />} /> 
        <Route path="/payment" element={<Payment/>} />
        <Route path="/orderstatus" element={<OrderStatus/>} />
        {/* Dynamic Product Info Route */}
      </Routes>
    </Router>
  );
}

export default App;
