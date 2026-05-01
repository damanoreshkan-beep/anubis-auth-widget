import { render } from 'preact'
import './index.css'
import './lib'        // registers <anubis-auth> Custom Element
import { App } from './app'

render(<App />, document.getElementById('app')!)
