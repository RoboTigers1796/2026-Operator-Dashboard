import { Box, color, display, fontSize, height, width } from "@mui/system";




export default function Timeline({autoWin, matchTime, areRed, Style}) {

    let firstColor = 'limeGreen';
    let secondColor = 'gold';

    let firstText = "";
    let secondText = "";

    if (autoWin === 'R') {
        firstColor = 'blue';
        secondColor = 'red';
        if(areRed){
            firstText = "";
            secondText = "Your Shift";
        } else if(!areRed){
            firstText = "Your Shift";
            secondText = "";
        }
    } else if (autoWin === 'B') {
        firstColor = 'red';
        secondColor = 'blue';
        if(!areRed){
            firstText = "";
            secondText = "Your Shift";
        } else if(areRed){
            firstText = "Your Shift";
            secondText = "";
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
                position: 'relative',
            }}
        >
            <Box sx={{backgroundColor: 'black', height: '50px', width: '6px', position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: `calc(100% * (${matchTime} / 140) - 3px)`}}></Box>
            <Box sx={{display: 'flex', flexDirection: 'column',backgroundColor: 'purple', flex: 10 / 140, height: '30px'}}></Box>
            <Box sx={{backgroundColor: firstColor, flex: 25 / 140, height: '30px'}}><Style sx ={{backgroundColor: 'transparent', fontSize: '23px', color: 'gold'}}> {firstText}</Style></Box>
            <Box sx={{backgroundColor: secondColor, flex: 25 / 140, height: '30px'}}><Style sx ={{backgroundColor: 'transparent', fontSize: '23px', color: 'gold'}}> {secondText}</Style></Box>
            <Box sx={{backgroundColor: firstColor, flex: 25 / 140, height: '30px'}}><Style sx ={{backgroundColor: 'transparent', fontSize: '23px', color: 'gold'}}> {firstText}</Style></Box>
            <Box sx={{backgroundColor: secondColor, flex: 25 / 140, height: '30px'}}><Style sx ={{backgroundColor: 'transparent', fontSize: '23px', color: 'gold'}}> {secondText}</Style></Box>
            <Box sx={{backgroundColor: 'purple', flex: 30 / 140, height: '30px'}}></Box>
        </Box>
    )
}

