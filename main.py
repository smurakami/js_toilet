class Attention:
    def __init__(self, e_hid_dim, d_hid_dim, out_dim, h_enc, m_h_enc):
        self.W_cc = tf.Variable(rng.uniform(low=-0.08, high=0.08, size=[e_hid_dim, out_dim]).astype('float32'), name='W_cc')
        self.W_ch = tf.Variable(rng.uniform(low=-0.08, high=0.08, size=[d_hid_dim, out_dim]).astype('float32'), name='W_ch')
        self.W_a  = tf.Variable(rng.uniform(low=-0.08, high=0.08, size=[e_hid_dim, d_hid_dim]).astype('float32'), name='W_a')
        self.b    = tf.Variable(np.zeros([out_dim]).astype('float32'), name='b')
        self.h_enc = h_enc
        self.m_h_enc = m_h_enc

    def f_prop(self, h_dec):
        # self.h_enc: [batch_size(i), enc_length(j), e_hid_dim(k)]
        # self.W_a  : [e_hid_dim(k), d_hid_dim(l)]
        # -> h_enc: [batch_size(i), enc_length(j), d_hid_dim(l)]
        # h_enc = # WRITE ME!
        h_enc = tf.einsum('ijk,kl->ijl', self.h_enc, self.W_a)
        
        # h_dec: [batch_size(i), dec_length(j), d_hid_dim(k)]
        # h_enc: [batch_size(i), enc_length(l), d_hid_dim(k)]
        # -> score: [batch_size(i), dec_length(j), enc_length(l)]
        # score = # WRITE ME! # Attention score
        score = tf.einsum('ijk,ilk->ijl', h_dec, h_enc)
        
        # score  : [batch_size, dec_length, enc_length]
        # m_h_enc: [batch_size, enc_length] -> [batch_size, np.newaxis, enc_length]
        m_h_enc = self.m_h_enc[:, np.newaxis, :]
        score = score * m_h_enc
        
        # encoderのステップにそって正規化する
        # self.a = # WRITE ME! # Attention weight
        self.a = tf.nn.softmax(score)
        
        # self.a  : [batch_size(i), dec_length(j), enc_length(k)]
        # self.enc: [batch_size(i), enc_length(k), e_hid_dim(l)]
        # -> c: [batch_size(i), dec_length(j), e_hid_dim(l)]
        # c = # WRITE ME! # Context vector
        c = tf.einsum('ijk,ikl->ijl', self.a, self.h_enc)
        
        return tf.nn.tanh(tf.einsum('ijk,kl->ijl', c, self.W_cc) + tf.einsum('ijk,kl->ijl', h_dec, self.W_ch) + self.b)
    
    def f_prop_test(self, h_dec_t):
        # self.h_enc: [batch_size(i), enc_length(j), e_hid_dim(k)]
        # self.W_a  : [e_hid_dim(k), d_hid_dim(l)]
        # -> h_enc: [batch_size(i), enc_length(j), d_hid_dim(l)]
        # h_enc = # WRITE ME!
        h_enc = tf.einsum('ijk,kl->ijl', self.h_enc, self.W_a)
        
        # h_dec_t: [batch_size(i), d_hid_dim(j)]
        # h_enc  : [batch_size(i), enc_length(k), d_hid_dim(j)]
        # -> score: [batch_size(i), enc_length(k)]
        # score = # WRITE ME! # Attention score
        score = tf.einsum('ij,ikj->ik', h_dec_t, h_enc)
        
        # score       : [batch_size(i), enc_length(k)]
        # self.m_h_enc: [batch_size(i), enc_length(k)]
        # score = # WRITE ME!
        score = score * self.m_h_enc
        
        self.a = tf.nn.softmax(score)
        
        # self.a    : [batch_size(i), enc_length(j)]
        # self.h_enc: [batch_size(i), enc_length(j), e_hid_dim(k)]
        # -> c: [batch_size(i), e_hid_dim(k)]
        # c = # WRITE ME! # Context vector
        c = tf.einsum('ij,ijk->ik', self.a, self.h_enc)

        return tf.nn.tanh(tf.matmul(c, self.W_cc) + tf.matmul(h_dec_t, self.W_ch) + self.b)