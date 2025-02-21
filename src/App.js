import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home/Home";
import Contact from "./Components/Contact/Contact";
import Cart from "./Components/Cart/Cart";
import Products from "./Components/Products/Products";
import ProductInfo from "./Components/ProductInfo/ProductInfo";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/products" element={<Products />} />
        <Route path="/productinfo/:id" element={<ProductInfo />} /> 
        {/* Dynamic Product Info Route */}
      </Routes>
    </Router>
  );
}

export default App;
