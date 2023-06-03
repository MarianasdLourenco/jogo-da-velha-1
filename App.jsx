import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Button,
} from "react-native";
import FirebaseAuth from "./firebase";

const firebase = new FirebaseAuth();

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tela, setTela] = useState("login");
  const [jogadorAtual, setJogadorAtual] = useState("");
  const [tabuleiro, setTabuleiro] = useState([]);
  const [jogadasRestantes, setJogadasRestantes] = useState(0);
  const [ganhador, setGanhador] = useState("");

  useEffect(() => {
    firebase.appAuth.onAuthStateChanged((user) => {
      if (user) {
        setTela("menu");
      } else {
        setTela("login");
      }
    });
  }, []);

  function iniciarJogo(jogador) {
    setJogadorAtual(jogador);

    setJogadasRestantes(9);
    setTabuleiro([
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ]);

    setTela("jogo");
  }

  switch (tela) {
    case "menu":
      return getTelaMenu();
    case "jogo":
      return getTelaJogo();
    case "ganhador":
      return getTelaGanhador();
    case "login":
      return getLogin();
  }

  function jogar(linha, coluna) {
    tabuleiro[linha][coluna] = jogadorAtual;
    setTabuleiro([...tabuleiro]);

    setJogadorAtual(jogadorAtual === "X" ? "O" : "X");

    verificarGanhador(tabuleiro, linha, coluna);
  }

  function verificarGanhador(tabuleiro, linha, coluna) {
    //LINHAS
    if (
      tabuleiro[linha][0] !== "" &&
      tabuleiro[linha][0] === tabuleiro[linha][1] &&
      tabuleiro[linha][1] === tabuleiro[linha][2]
    ) {
      return finalizarJogo(tabuleiro[linha][0]);
    }

    //COLUNAS
    if (
      tabuleiro[0][coluna] !== "" &&
      tabuleiro[0][coluna] === tabuleiro[1][coluna] &&
      tabuleiro[1][coluna] === tabuleiro[2][coluna]
    ) {
      return finalizarJogo(tabuleiro[0][coluna]);
    }

    //DIAGONAL 1
    if (
      tabuleiro[0][0] !== "" &&
      tabuleiro[0][0] === tabuleiro[1][1] &&
      tabuleiro[1][1] === tabuleiro[2][2]
    ) {
      return finalizarJogo(tabuleiro[0][0]);
    }

    //DIAGONAL 2
    if (
      tabuleiro[0][2] !== "" &&
      tabuleiro[0][2] === tabuleiro[1][1] &&
      tabuleiro[1][1] === tabuleiro[2][0]
    ) {
      return finalizarJogo(tabuleiro[0][2]);
    }

    //EMPATE
    if (jogadasRestantes - 1 === 0) {
      return finalizarJogo("");
    }

    //JOGO CONTINUA
    setJogadasRestantes(jogadasRestantes - 1);
  }

  function finalizarJogo(jogador) {
    setGanhador(jogador);
    setTela("ganhador");
  }

  function getLogin() {
    return (
      <View style={styles.container}>
        <View>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style
            secureTextEntry
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
          />
          <View>
            <Text>{errorMessage}</Text>
          </View>
          <View>{loading && <Text>Carregando...</Text>}</View>
          <Button
            onPress={() => {
              setLoading(true);
              setErrorMessage("");
              firebase.handleLogin({
                auth: firebase.appAuth,
                password,
                email,
                onError: (err) => {
                  setErrorMessage(err);
                },
              });
              setLoading(false);
            }}
            title="Login"
          />

          <Button
            onPress={() => {
              setLoading(true);
              setErrorMessage("");
              firebase.handleCreateAccount({
                auth: firebase.appAuth,
                password,
                email,
                onError: (err) => {
                  setErrorMessage(err);
                },
              });
              setLoading(false);
            }}
            title="Create"
          />
        </View>
      </View>
    );
  }

  function getTelaMenu() {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Text style={styles.titulo}>Jogo da velha</Text>
        <Text style={styles.subtitulo}>Selecione o primeiro jogador</Text>

        <View style={styles.inlineItems}>
          <TouchableOpacity
            style={styles.boxJogador}
            onPress={() => iniciarJogo("X")}
          >
            <Text style={styles.jogadorX}>X</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boxJogador}
            onPress={() => iniciarJogo("O")}
          >
            <Text style={styles.jogadorO}>O</Text>
          </TouchableOpacity>
        </View>
        <View>
          <Button
            onPress={() => {
              setTela("login");
              firebase.signOut();
            }}
						title="Sair"
          />
        </View>
      </View>
    );
  }

  function getTelaJogo() {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Text style={styles.titulo}>Jogo da velha</Text>
        {tabuleiro.map((linha, numeroLinha) => {
          return (
            <View key={numeroLinha} style={styles.inlineItems}>
              {linha.map((coluna, numeroColuna) => {
                return (
                  <TouchableOpacity
                    key={numeroColuna}
                    style={styles.boxJogador}
                    onPress={() => jogar(numeroLinha, numeroColuna)}
                    disabled={coluna !== ""}
                  >
                    <Text
                      style={coluna === "X" ? styles.jogadorX : styles.jogadorO}
                    >
                      {coluna}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
        <TouchableOpacity
          style={styles.botaoMenu}
          onPress={() => setTela("menu")}
        >
          <Text style={styles.textBotaoMenu}>Volta ao menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function getTelaGanhador() {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Text style={styles.titulo}>Jogo da velha</Text>
        <Text style={styles.subtitulo}>Resultado final</Text>

        {ganhador === "" && (
          <Text style={styles.ganhador}>Nenhum ganhador</Text>
        )}

        {ganhador !== "" && (
          <>
            <Text style={styles.ganhador}>Ganhador</Text>
            <View style={styles.boxJogador}>
              <Text
                style={ganhador === "X" ? styles.jogadorX : styles.jogadorO}
              >
                {ganhador}
              </Text>
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.botaoMenu}
          onPress={() => setTela("menu")}
        >
          <Text style={styles.textBotaoMenu}>Volta ao menu</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "gray",
    borderWidth: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#333",
  },

  subtitulo: {
    fontSize: 20,
    color: "#555",
    marginTop: 20,
  },

  inlineItems: {
    flexDirection: "row",
  },

  boxJogador: {
    width: 80,
    height: 80,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
  },

  jogadorX: {
    fontSize: 50,
    color: "#00FFFF",
  },

  jogadorO: {
    fontSize: 50,
    color: "#FF6600",
  },

  botaoMenu: {
    marginTop: 20,
  },

  textBotaoMenu: {
    color: "#4e6fe4",
  },

  ganhador: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#333",
  },
});
