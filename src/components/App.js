import './App.css'
import Navbar from './Navbar.js'
import React, {Component} from "react";
import Web3 from 'web3';
import Tether from '../truffle_abis/Tether.json'
import RWD from '../truffle_abis/RWD.json'
import DecentralBank from '../truffle_abis/DecentralBank.json'
import Main from './Main.js'



class App extends Component {

    async UNSAFE_componentWillMount() {        
        await this.loadWeb3()
        await this.loadBlockchainData()
        
    }

    async loadWeb3() {
        if(window.ethereum) {
            console.log('Using window.ethereum')
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        } else if(window.web3){
            console.log('Using window.web3.currentPRovider')
            window.web3 = new Web3(window.web3.currentProvider)
            }else{
                throw new Error('No ethereum browser detected! You can check out metamask')
            }
        }
    
    async loadBlockchainData() {
        const web3 = window.web3
        const account = await web3.eth.getAccounts()
        this.setState({account:account[0]})
        const networkId = await web3.eth.net.getId()

        //load tether contract
        const tetherData = Tether.networks[networkId]
        if(tetherData) {
            const tether = new web3.eth.Contract(Tether.abi,tetherData.address)
            this.setState({tether})
            let tetherBalance = await tether.methods.balanceOf(this.state.account).call()
            this.setState({tetherBalance: tetherBalance.toString() })
            console.log({balance: tetherBalance})
        } else {
            window.alert('Error! Tether contract not deployed - no detected network')
        }    
        
        
         //load RWD contract
         const rwdData = RWD.networks[networkId]
         if(rwdData) {
             const rwd = new web3.eth.Contract(RWD.abi,rwdData.address)
             this.setState({rwd})
             let rwdBalance = await rwd.methods.balanceOf(this.state.account).call()
             this.setState({rwdBalance: rwdBalance.toString() })
             console.log({balance: rwdBalance})
         } else {
             window.alert('Error! RWD contract not deployed - no detected network')
         } 

         //load DecentralBank contract
         const decentralBankData = DecentralBank.networks[networkId]
         if(decentralBankData) {
             const decentralBank = new web3.eth.Contract(DecentralBank.abi,decentralBankData.address)
             this.setState({decentralBank})
             let stakingBalance = await decentralBank.methods.stakingBalance(this.state.account).call()
             this.setState({stakingBalance: stakingBalance.toString() })
             console.log({balance: stakingBalance})
         } else {
             window.alert('Error! Decentral Bank contract not deployed - no detected network')
         } 
        
        this.setState({loading: false})

    }

    //two functions one that stakes and other for unstakes
    //leverage our decentralBank contract - deposit tokens and unstaking
    // all of this for staking
    //deposit transferFrom..
    //function apporve transaction hash --
    //STAKING funciton ? >> decentralBank.depositTokens(send transactionHAsh =>)

    //staking function
    stakeTokens = (amount) => {
        this.setState({loading: true})
        this.state.tether.methods.approve(this.state.decentralBank._address,amount).send({from: this.state.account}).on('transactionHash', (hash) =>{
        this.state.decentralBank.methods.depositTokens(amount).send({from: this.state.account}).on('transactionHash', (hash) =>{
            this.setState({loading: false})
        })

    })
    }

    unstakeTokens = (amount) => {
        this.setState({loading:true})
        this.state.decentralBank.methods.unstakeTokens(amount).send({from: this.state.account}).on('transactionHash', (hash) =>{
            this.setState({loading: false})
        })

    }


    


    

    constructor(props){
        super(props)
        this.state = {
            account: '0x0',
            tether:{},
            rwd: {},
            decentralBank:{},
            tetherBalance:'0',
            rwdBalance:'0',
            stakingBalance:'0',
            loading: true
        }
    }
    //react code goes here
    render() {
        let content
        {this.state.loading ? content = <p id='loader' className="text-center" style={{margin:'30px'}}>LOADING PLEASE..</p> : content = <Main
        tetherBalance={this.state.tetherBalance}
        rwdBalance={this.state.rwdBalance}
        stakingBalance={this.state.stakingBalance}
        stakeTokens = {this.stakeTokens}
        unstakeTokens = {this.unstakeTokens}/>
        return(
            <div>
                <Navbar account={this.state.account}/>

                    <div className="container-fluid mt-5">
                        <div className='row'>
                            <main role='main' className='col-lg-12 ml-auto mr-auto' style={{maxWidth:'600px',minHeight:'100vm'}}>
                                <div>
                                    {content}
                                </div>

                            </main>
                        </div>                                         
                    </div>
            </div>
        )
            


        
    }
}
}

export default App;