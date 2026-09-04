import { Outlet } from 'react-router-dom'
import NavbarV2 from '../../pages/Home/components/NavbarV2'
import Footer from '../Footer/Footer'
import SystemAlert from '../SystemAlert'
import styled from 'styled-components'

const Main = styled.main`
  min-height: calc(100vh - 300px);
  padding-top: 100px; /* Space for fixed Navbar */
`

export default function Layout() {
  return (
    <>
      <SystemAlert />
      <NavbarV2 />
      <Main>
        <Outlet />
      </Main>
      <Footer />
    </>
  )
}
