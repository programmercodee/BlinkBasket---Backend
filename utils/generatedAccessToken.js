import jwt from 'jsonwebtoken'

const generatedAccessToken = async (userId) => {
  
  const token = await jwt.sign({ id: userId },

    process.env.SECRET_KEY_ACCESS_TOKEN,

    { expiresIn: '5h' } //time in hours e.g : 5h = 5hours
  )

  return token
}

export default generatedAccessToken;