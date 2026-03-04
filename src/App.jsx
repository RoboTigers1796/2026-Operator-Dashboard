import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

import { Box } from '@mui/material';
import './App.css';
import { SimpleDialog } from './components/SimpleDialogue';
import Timeline from './components/Timeline';

function App() {
    function useLocalStorage(key, initialValue) {
        const [storedValue, setStoredValue] = useState(() => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : initialValue;
            } catch (error) {
                return initialValue;
            }
        });

        useEffect(() => {
            localStorage.setItem(key, JSON.stringify(storedValue));
        }, [key, storedValue]);

        return [storedValue, setStoredValue];
    }

    function getRemainingTime(secondsRemainingInPeriod, isTeleop, isRed, autoWin) {
        console.log(secondsRemainingInPeriod);

        if (!isTeleop) return secondsRemainingInPeriod;

        let teleopTime = 140 - secondsRemainingInPeriod;
        let autoWon = false;
        if (isRed) {
            autoWon = autoWin === 'R';
        } else {
            autoWon = autoWin === 'B';
        }

        if (teleopTime <= 10) {
            if (!autoWon) { // if we lost auto then we are active for the first 35 seconds of teleop
                return 35 - teleopTime;
            }
            return 10 - teleopTime;
        } else if (teleopTime <= 110) {
            if (autoWon) {  // if we won auto then we are active for the last 55 seconds of teleop
                if (getPhase(teleopTime - 10) === 3) {
                    return 55 - ((teleopTime - 10) % 25 || 25)
                }
            }
            return 25 - ((teleopTime - 10) % 25 || 25)
        } else {
            return secondsRemainingInPeriod;
        }
    }

    function getPhase(timer) {
        return Math.max(0, Math.min(3, Math.ceil(timer / 25) - 1));
    }

    function isPhaseOdd(phase) {
        return phase % 2 === 1;
    }

    function getCurrentPhase(secondsRemainingInPeriod, isTeleop) {
        if (!isTeleop) return "Auto";

        const teleopTime = 140 - secondsRemainingInPeriod
        if (teleopTime <= 10) {
            return "Transition Phase";
        } else if (teleopTime <= 110) {
            return getPhase(teleopTime - 10) + 1;
        } else {
            return "End Game";
        }
    }

    function getHubActive(secondsRemainingInPeriod, isRed, autoWin, isTeleop) {
        if (!isTeleop) return true;

        const teleopTime = 140 - secondsRemainingInPeriod;
        if (teleopTime <= 10) {
            return true;
        } else if (teleopTime <= 110) {
            let phase = getPhase(teleopTime - 10);
            if (autoWin === 'R') {
                return isRed ? isPhaseOdd(phase) : !isPhaseOdd(phase);
            } else {
                return isRed ? !isPhaseOdd(phase) : isPhaseOdd(phase);
            }
        } else {
            return true;
        }
    }

    useEffect(() => {
        const handleContextMenu = (event) => {
            event.preventDefault();
        };

        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    function roundToTenth(number) {
        return Math.round(number * 10) / 10;
    }

    function roundToHundredth(number) {
        return Math.round(number * 100) / 100;
    }

    function getDataFromServer(isTeleop) {
        axios({
            method: 'GET',
            url: 'http://127.0.0.1:5000/networktabledata',
        })
            .then((response) => {

                console.log('Full response from server:', response); // Log entire response
                console.log('Response data:', response.data.ds_time); // Log just the data
                console.log('Response data:', response.data.is_connected); // Log just the data
                console.log('Response Data', response.data.auto_win);
                console.log('Response Data', response.data.is_red_alliance);

                const res = response.data;
                const time = Math.max(0, res.ds_time);

                const calculatedMinutes = Math.floor(
                    time / 60
                );
                const calculatedSeconds = Math.floor(
                    time % 60
                );
                setDsMinutes(calculatedMinutes);
                setDsSeconds(calculatedSeconds);
                const timeLeftInShift = res.ds_time === -1 ? 0 : roundToTenth(getRemainingTime(time, isTeleop, res.is_red_alliance, res.auto_win));
                setTimeLeftInShift(timeLeftInShift);
                setIsCritical(timeLeftInShift <= 5);
                setIsFieldConnected(res.is_connected);
                setAutonWin(res.auto_win);
                setIsRed(res.is_red_alliance);
                setIsHubActive(getHubActive(time, res.is_red_alliance, res.auto_win, isTeleop));
                setRedWin(res.auto_win === 'R');
                setCurrentPhase(getCurrentPhase(time, isTeleop));

                if (res.ds_time <= 0) {
                    setIsTeleop(false)
                } else if (res.ds_time >= 100) {
                    setIsTeleop(true);
                }

                setTimeElapsedInPeriod(isTeleop ? roundToHundredth(140 - time) : roundToHundredth(20 - time));


                if (response.status === 200) {
                    setIsServerConnected(true);
                } else {
                    setIsServerConnected(false);
                }
            })
            .catch((error) => {
                setIsServerConnected(false);
                console.log(error);
            });
    }

    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: '#fff',
        ...theme.typography.body2,
        boxShadow: 'none',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '40px',
        fontFamily: 'Roboto',
        color: theme.palette.text.secondary,
        ...theme.applyStyles('dark', {
            backgroundColor: '#1A2027',
        }),
    }));

    const [dsMinutes, setDsMinutes] = useLocalStorage('dsMinutes', 0);
    const [dsSeconds, setDsSeconds] = useLocalStorage('dsSeconds', 0);
    const [timeElapsedInPeriod, setTimeElapsedInPeriod] = useLocalStorage('timeElapsedInPeriod', 0);
    const [timeLeftInShift, setTimeLeftInShift] = useLocalStorage('timeLeftInShift', 0);
    const [currentPhase, setCurrentPhase] = useLocalStorage('currentPhase', "Transition Period")
    const [redWin, setRedWin] = useLocalStorage('redWin', false)
    const [autonWin, setAutonWin] = useLocalStorage('autoWinner', "Not determined");
    const [isTeleop, setIsTeleop] = useLocalStorage('isTeleop', false);
    const [isRed, setIsRed] = useLocalStorage('isRed', false);
    const [isHubActive, setIsHubActive] = useLocalStorage('isHubActive', false)
    const [isCritical, setIsCritical] = useLocalStorage('isCritical', false);

    const [isFieldConnected, setIsFieldConnected] = useLocalStorage(
        'isConnected',
        false
    );
    const [isServerConnected, setIsServerConnected] = useLocalStorage(
        'isServerConnected',
        false
    );

    const [open, setOpen] = useLocalStorage('resetDialog', false);

    const sendDataToServer = useCallback(async () => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/update', {
            });
            console.log('Response from server:', response.data);
        } catch (error) {
            console.error('Error sending data to server:', error);
        }
    }, []);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        sendDataToServer();

        const interval = setInterval(() => {
            sendDataToServer();
            getDataFromServer(isTeleop);
        }, 100);

        return () => clearInterval(interval); // Cleanup when component unmounts
    }, [sendDataToServer, isTeleop]);

    const resetStates = () => {
        setIsTeleop(false);
    };

    return (
        <>
            <Box
                sx={{
                    height: 'calc(100vh)',
                    width: 'calc(100vw)',
                    display: 'flex',
                    flexDirection: 'column',
                    margin: '0 auto',
                    paddingTop: '20px',
                    bgcolor: isCritical ? Math.floor(timeLeftInShift * 5) % 2 === 0 ? '#FBEC5D' : 'transparent' : isHubActive ? "#54AB47" : "crimson",
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flex: 1,
                        alignItems: 'center',
                        position: 'relative',
                        flexDirection: 'column',
                    }}
                >
                    <Item
                        sx={{
                            fontSize: '30px',
                            padding: '12px 22px',
                            color: dsMinutes <= 0 && dsSeconds <= 10
                                ? 'red'
                                : 'white',
                            bgcolor: 'black',
                            userSelect: 'none',
                            borderRadius: '12px'
                        }}
                    >
                        Match Time: {dsMinutes}m {dsSeconds}s
                    </Item>
                    <Item
                        sx={{
                            fontSize: '50px',
                            WebkitTextStroke: isCritical ? Math.floor(timeLeftInShift * 5) % 2 === 0 ? '0%' : '20%' : '20%',
                            padding: '12px 22px',
                            userSelect: 'none',
                            width: '40%',
                            color: isCritical ? 'black' : 'white',
                            backgroundColor: isCritical ? Math.floor(timeLeftInShift * 5) % 2 === 0 ? '#FBEC5D' : 'transparent' : isHubActive ? "#54AB47" : "crimson",
                        }}
                    >
                        {isHubActive ? 'Active' : 'Inactive'} Time: {timeLeftInShift.toFixed(1)}s
                    </Item>
                    <Timeline autoWin={autonWin} matchTime={isTeleop ? timeElapsedInPeriod : 0} areRed={isRed} Style={Item} />
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            padding: '12px 22px',
                            bgcolor: '#181716',
                            marginTop: '30px',
                            width: '50%',
                            borderRadius: '15px'
                        }}
                    >
                        <Item
                            sx={{
                                fontSize: '40px',
                                color: 'white',
                                userSelect: 'none',
                                bgcolor: '#2a2727',
                                borderRadius: '15px'
                            }}
                        >
                            Match Info
                        </Item>

                        <Item
                            sx={{
                                fontSize: '40px',
                                color: 'white',
                                userSelect: 'none',
                                bgcolor: '#181716',
                            }}
                        >
                            Current phase: {currentPhase}
                        </Item>

                        <Item sx={{ fontSize: '40px', color: 'white', userSelect: 'none', bgcolor: '#181716' }}>
                            Auto winner:{' '}
                            {isTeleop ? (
                                <>
                                    You{' '}
                                    <span
                                        style={{
                                            color: redWin
                                                ? isRed
                                                    ? 'green'
                                                    : 'red'
                                                : isRed
                                                    ? 'red'
                                                    : 'green',
                                        }}
                                    >
                                        {redWin
                                            ? isRed
                                                ? 'WON'
                                                : 'LOST'
                                            : isRed
                                                ? 'LOST'
                                                : 'WON'}
                                    </span>{' '}
                                    Auto
                                </>
                            ) : (
                                'Auto period'
                            )}
                        </Item>
                    </Box>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        width: '25%',
                        flex: 0.25,
                        flexDirection: 'column',
                        userSelect: 'none',
                        justifyContent: 'space-between',
                        marginLeft: 'auto',
                        marginBottom: '3%'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            rowGap: '10px',
                        }}
                    >
                        <Button
                            variant='outlined'
                            onClick={handleClickOpen}
                            sx={{
                                fontSize: '25px',
                                border: 2,
                                borderColor: 'dodgeyblue',
                            }}
                        >
                            Reset
                        </Button>
                        <SimpleDialog
                            open={open}
                            close={handleClose}
                            resetStates={resetStates}
                        />
                        <Item
                            sx={{
                                fontSize: '25px',
                                color: 'white',
                                bgcolor: isServerConnected
                                    ? 'limegreen'
                                    : 'crimson',
                                padding: '12px 0px',
                            }}
                        >
                            Server Connected: {isServerConnected ? 'YES' : 'NO'}
                        </Item>
                        <Item
                            sx={{
                                fontSize: '25px',
                                color: 'white',
                                bgcolor: isFieldConnected
                                    ? 'limegreen'
                                    : 'crimson',
                                padding: '12px 0px',
                            }}
                        >
                            Field Connected: {isFieldConnected ? 'YES' : 'NO'}
                        </Item>
                    </Box>
                </Box>
            </Box>
        </>
    );
}

export default App;
