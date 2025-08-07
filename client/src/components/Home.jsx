import Navbar from './Navbar'
import Footer from './Footer'
import Main from './Main'
import About from './About'

function Home() {
 
  return (
    <>
    <Navbar />
      <div style={{ paddingTop: '70px', paddingBottom:' 40px' }}>
        <Main />
       <About />
      </div>
     <Footer />
    </>
  )
}

export default Home