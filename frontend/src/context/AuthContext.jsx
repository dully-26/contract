import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {

    const stored = localStorage.getItem('user');

    return stored ? JSON.parse(stored) : null;

  });


  const [loading, setLoading] = useState(true);



  useEffect(() => {

    const token = localStorage.getItem('token');


    if (token) {

      api.get('/me')

        .then((res) => {

          const currentUser = res.data.user ?? res.data;

          setUser(currentUser);

          localStorage.setItem(
            'user',
            JSON.stringify(currentUser)
          );

        })


        .catch(() => {

          localStorage.removeItem('token');
          localStorage.removeItem('user');

          setUser(null);

        })


        .finally(() => {

          setLoading(false);

        });


    } else {

      setLoading(false);

    }


  }, []);





  const login = async (email, password) => {


    const res = await api.post('/login', {

      email,
      password

    });



    const loggedUser = res.data.user;


    localStorage.setItem(
      'token',
      res.data.token
    );


    localStorage.setItem(
      'user',
      JSON.stringify(loggedUser)
    );


    setUser(loggedUser);


    return loggedUser;

  };






  const register = async (payload) => {


    const res = await api.post('/register', payload);



    const newUser = res.data.user;



    localStorage.setItem(
      'token',
      res.data.token
    );


    localStorage.setItem(
      'user',
      JSON.stringify(newUser)
    );


    setUser(newUser);


    return newUser;

  };







  const logout = async () => {


    try {

      await api.post('/logout');

    } catch (error) {

      console.log(error);

    }



    localStorage.removeItem('token');

    localStorage.removeItem('user');


    setUser(null);


  };





  return (

    <AuthContext.Provider

      value={{
        user,
        login,
        register,
        logout,
        loading
      }}

    >

      {children}

    </AuthContext.Provider>

  );

}



export const useAuth = () => useContext(AuthContext);