process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
chai.should();

chai.use(chaiHttp);

describe('Orders', () => {
    describe('/GET purchase/purchaseproduct ', () => {
        it('It purchase product', (done) => {
            chai.request(app)
                .get('/purchase/purchaseproduct')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    // res.body.length.should.be.eq(3);
                    done();
                });
        });

        it('It should not purchase product', (done) => {
            chai.request(app)
                .get('/purchase/purchaseproduct')
                .end((err, res) => {
                    res.body.data.should.be.eq('Error');
                    done();
                });
        });
    });
});
