import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Configurator from './pages/Configurator'
import Wiki from './pages/Wiki'
import TierLists from './pages/TierLists'
import Compare from './pages/Compare'
import Battle from './pages/Battle'
import Compendium from './pages/Compendium'
import Gameplay from './pages/Gameplay'
import Dedication from './pages/Dedication'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/configurator" element={<Configurator />} />
        <Route path="/wiki" element={<Wiki />} />
        <Route path="/tier-lists" element={<TierLists />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/battle" element={<Battle />} />
        <Route path="/compendium" element={<Compendium />} />
        <Route path="/gameplay" element={<Gameplay />} />
        <Route path="/dedication" element={<Dedication />} />
      </Route>
    </Routes>
  )
}
