import { Box, width } from "@mui/system";




export default function Timeline({autoWin, matchTime, areRed}) {

    let firstColor = 'limeGreen';
    let secondColor = 'gold';

    if (autoWin === 'R') {
        firstColor = 'blue';
        secondColor = 'red'
        if(areRed){

        }
    } else if (autoWin === 'B') {
        firstColor = 'red';
        secondColor = 'blue'
        if(!areRed){
            
        }
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                width: '99%',
                justifyContent: 'center',
                alignContent: 'center',
                backgroundColor: 'purple',
                marginTop: '60px',
                position: 'relative'
            }}
        >
            <Box sx={{backgroundColor: 'black', height: '50px', width: '6px', position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: `calc(100% * (${matchTime} / 140) - 3px)`}}></Box>
            <Box sx={{backgroundColor: 'purple', flex: 10 / 140, height: '30px'}}></Box>
            <Box sx={{backgroundColor: firstColor, flex: 25 / 140, height: '30px'}}></Box>
            <Box sx={{backgroundColor: secondColor, flex: 25 / 140, height: '30px'}}></Box>
            <Box sx={{backgroundColor: firstColor, flex: 25 / 140, height: '30px'}}></Box>
            <Box sx={{backgroundColor: secondColor, flex: 25 / 140, height: '30px'}}></Box>
            <Box sx={{backgroundColor: 'purple', flex: 30 / 140, height: '30px'}}></Box>
        </Box>
    )
}

