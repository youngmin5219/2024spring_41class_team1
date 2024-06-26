import Header from "../components/Header";
import AdBanner from "../components/AdBanner";
import CodeField from "../components/CodeField";
import { Button, styled, Box } from "@mui/material";
import { FileUpload } from "@mui/icons-material";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from "react-router-dom";


const Section = styled(Box)({
  minHeight: 30,
  padding: 20,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

const Bulletin = styled("img")({
  margin: 10,
  width: 1000,
  height: 250,
  background: "lightgray",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

const Container = styled(Box)({
  display: "flex",
  alignItems: "center",
});

const RefactoringArea = styled(Box)({
  width: 1000,
  display: "flex",
  flexDirection: "column",
});

const DropBox = styled(Box)({
  height: 240,
  border: "2px dashed #dee2e6",
  borderRadius: 5,
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  userSelect: "none",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

const UploadButton = styled(Button)({
  marginTop: 4,
  marginBottom: 8,
  padding: 20,
  border: "2px solid #dee2e6",
  borderRadius: 5,
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  fullWidth: true,
});

const ConvertButton = styled(Button)({
  padding: 20,
  border: "1px solid #dee2e6",
  borderRadius: 5,
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  fullWidth: true,
});

const CopyButton = styled(Button)({
  padding: 20,
  border: "1px solid #dee2e6",
  borderRadius: 5,
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  fullWidth: true,
});

const MainTopPage = ({setCode}) => {
  const [AdUrls, setAdUrls] = useState([]);
  const inputRef = useRef(null);
  const resultRef = useRef(null);
  const AdRef = [useRef(null), useRef(null)];
  const { setRole } = useAuth();

  const defaultPageSet = () => {
    const defaultAds = ["/logo.png"];
    AdRef[0].current.initialize(defaultAds, 0);
    AdRef[1].current.initialize(defaultAds, parseInt(defaultAds.length / 2));
  };

  const OnPageLoad = async () => {  //페이지 로드할 때 광고리스트 받아오기
    try {  //세션 획득
      const session_response = await fetch("/session", {
        method: "GET",
      });
      if (session_response.ok) {
        const session_data = await session_response.json();
        //세션 정보 확인.
        if (session_data.authorities[0].authority === 'ROLE_ADMIN') { //ADMIN 권한 확인 후 HEADER 형태 수정
          setRole('ROLE_ADMIN');
        }
        else if (session_data.authorities[0].authority === 'ROLE_USER') { //사용자 권한인 경우 HEADER 형태 수정
          setRole('ROLE_USER');
        }
      }
      else {
        //throw new Error('session response error');
        console.log("there's no session");
      }
    } catch {
      console.log("session connection error");
    }
  };

  const SetEditor = (files) => {  // 파일 업로드
    if (files.length !== 1) {
      alert("파일은 한 번에 하나씩 업로드해야 합니다.");
      return -1;
    }

    const file = files[0];

    let fileReader = new FileReader();
    fileReader.onload = () => {
      if (!file.name.match(/(.*?)\.(txt|java)$/)) {
        if (
          !window.confirm(
            "Java 소스코드 형식의 파일이 아닙니다.\n그래도 여시겠습니까?"
          )
        ) {
          return -1;
        }
      }
      inputRef.current.editor.setValue(fileReader.result, -1);
    };
    fileReader.readAsText(file);
  };

  const HandleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const FileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    SetEditor(e.dataTransfer.files);
  };

  const BrowseFile = () => {
    var input = document.createElement("input");
    input.type = "file";
    input.onchange = function (e) {
      SetEditor(e.target.files);
    };
    input.click();
  };

  const Convert = async () => {
    const codeContent = inputRef.current.editor.getValue();   //code editor로부터 code 받아오기
    setCode(codeContent);
    try {
      const response = await fetch("/refactoring", {    // /refcatoring에 코드 포함한 POST request 전송
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: codeContent,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json(); // JSON 형식으로 response 파싱
      if (responseData.code) { // code 키 확인
        resultRef.current.editor.setValue(responseData.code); // 결과 필드에 코드 출력

        try {  //세션 획득
          const session_response = await fetch("/session", {
            method: "GET",
          });
          if (session_response.ok) {
            const session_data = await session_response.json();
            //세션 정보 확인.
            if (session_response.ok && session_data.id) {
              if (session_data.id) {
                // 세션 ID로 /bit 요청
                const bitResponse = await fetch("/bit", {
                  method: "POST",
                  headers: {
                    "Content-Type": "text/plain",
                  },
                  body: session_data.id,
                });

                if (!bitResponse.ok) {
                  alert("fail to get bits");
                }
                alert("get 10 bits");
              }
            }
            else {
              //throw new Error('session response error');
              console.log("there's no session");
            }
          }
        } catch {
          console.log("session connection error");
        }
        inputRef.current.editor.setValue(codeContent);

      } else {
        throw new Error("Invalid data structure from server response");
      }
    } catch {
      alert("Refactoring에 실패하였습니다.\n잠시 후 다시 시도해주세요.");
    }
  };

  const CopyToClipboard = (text) => {
    navigator.clipboard
      .writeText(resultRef.current.editor.getValue())
      .then(() => {
        alert("클립보드에 성공적으로 복사하였습니다.");
      })
      .catch((error) => {
        alert("클립보드 복사에 실패하였습니다. 잠시 후 다시 시도해주세요.");
      });
  };

  useEffect(() => {
    OnPageLoad();
  }, []); //페이지 로드시 일회성으로 실행되는 코드. 세션 확인

  useEffect(() => {   //광고 받아오기
    const fetchAds = async () => {
      try {
        const response = await fetch("/advertisements?status=approved", { //승인된 광고 리스트 받아오기
          method: "GET",
        });
        if (!response.ok) throw new Error("Network response was not ok");
        const img_data = await response.json(); //광고 리스트 데이터 파싱
        const urls = img_data.filter((i) => !AdUrls.includes(i.imageUrl)).map(i => i.imageUrl);
        setAdUrls(urls);
        //console.log(urls);

        //좌우 광고 배너에 광고 표시
        AdRef[0].current.initialize(urls, 0);
        AdRef[1].current.initialize(urls, parseInt(urls.length / 2));
      } catch (error) {
        console.log("img load error");
        defaultPageSet();
      }
    };
    fetchAds();
  }, []);

  return (
    <div>
      <Header />
      <Section>
        <Bulletin src={"/logo.png"}></Bulletin>
      </Section>

      <Section>
        <AdBanner ref={AdRef[0]}>Ad_1</AdBanner>
        <Container>
          <RefactoringArea>
            <DropBox onDrop={FileDrop} onDragOver={HandleDragOver}>
              <FileUpload fontSize="large"></FileUpload>
              <p>Drag and drop your source code!</p>
            </DropBox>
            <UploadButton onClick={BrowseFile}>
              ...or browse your file
            </UploadButton>
            <CodeField
              readOnly={false}
              theme="terminal"
              placeholder="Input your source code here."
              ref={inputRef}
            ></CodeField>
            <ConvertButton
              variant="contained"
              color="primary"
              onClick={Convert}
            >
              Convert!
            </ConvertButton>
            <CodeField
              readOnly={true}
              theme="mono_industrial"
              placeholder="Refactored code will be here."
              ref={resultRef}
            ></CodeField>
            <CopyButton
              variant="contained"
              color="primary"
              onClick={CopyToClipboard}
            >
              Copy to your clipboard
            </CopyButton>
          </RefactoringArea>
        </Container>
        <AdBanner ref={AdRef[1]}>Ad_2</AdBanner>
      </Section>
    </div>
  );
};

export default MainTopPage;