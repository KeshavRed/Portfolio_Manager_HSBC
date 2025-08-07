import { Routes, Route } from 'react-router-dom';
import NavigationBar from './components/Navbar';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import AssetManager from './components/Form/AssetManagement';
import StockDetails from './components/StockDetails';
import MFDetails from './components/MFDetails';
import PortfolioTable from './components/PortfolioTable';
import TransactionHistory from './components/TransactionHistory';

function App() {
  return (
    <>
      <NavigationBar />
      <div >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crud" element={<AssetManager />} />
          <Route path="/stocks/:id" element={<StockDetails />} />
          <Route path="/mfs/:id" element={<MFDetails />} />
          <Route path="/portfolio" element={<PortfolioTable />} />
          <Route path="/transactions" element={<TransactionHistory />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
