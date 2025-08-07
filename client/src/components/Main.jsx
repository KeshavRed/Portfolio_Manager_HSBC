import React from 'react'
import main_image from '../assets/main.png'
import { Link } from 'react-router-dom'
import './Main.css'
const Main = () => {
  return (
    <div className='main_home'>
        <div className="text_main">
            <h1>Welcome to Financial Insight</h1>
            <h2>Glance, gauge, grow !</h2>
            <Link to='/portfolio'><button>View Portfolio </button></Link>
        </div>
      <div className="image_main">
        <img src={main_image} alt="" />
      </div>
    </div>
  )
}

export default Main
