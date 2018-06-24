// Code generated by Remoto; DO NOT EDIT.

package greeter

import (
	"context"
	"encoding/json"
	"io"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"strconv"

	"github.com/matryer/remoto/remototypes"
	"github.com/oxtoacart/bpool"
	"github.com/pkg/errors"
)

// GreeterClient accesses remote Greeter services.
type GreeterClient struct {
	// endpoint is the HTTP endpoint of the remote server.
	endpoint string
	// httpclient is the http.Client to use to make requests.
	httpclient *http.Client
	// bufs is a buffer pool
	bufs *bpool.BufferPool
}

// NewGreeterClient makes a new GreeterClient that will
// use the specified http.Client to make requests.
func NewGreeterClient(endpoint string, client *http.Client) *GreeterClient {
	return &GreeterClient{
		endpoint:   endpoint,
		httpclient: client,
		bufs:       bpool.NewBufferPool(48),
	}
}

func (c *GreeterClient) Greet(ctx context.Context, request *GreetRequest) (*GreetResponse, error) {
	resp, err := c.GreetMulti(ctx, []*GreetRequest{request})
	if err != nil {
		return nil, err
	}
	if len(resp) == 0 {
		return nil, errors.New("GreeterClient.Greet: no response")
	}
	return resp[0], nil
}

func (c *GreeterClient) GreetMulti(ctx context.Context, requests []*GreetRequest) ([]*GreetResponse, error) {
	b, err := json.Marshal(requests)
	if err != nil {
		return nil, errors.Wrap(err, "GreeterClient.Greet: encode request")
	}
	buf := c.bufs.Get()
	defer c.bufs.Put(buf)
	w := multipart.NewWriter(buf)
	w.WriteField("json", string(b))
	if files, ok := ctx.Value(contextKeyFiles).(map[string]file); ok {
		for fieldname, file := range files {
			f, err := w.CreateFormFile(fieldname, file.filename)
			if err != nil {
				return nil, errors.Wrap(err, "GreeterClient.Greet: create form file")
			}
			if _, err := io.Copy(f, file.r); err != nil {
				return nil, errors.Wrap(err, "GreeterClient.Greet: reading file")
			}
			select {
			case <-ctx.Done():
				return nil, ctx.Err()
			default:
			}
		}
	}
	if err := w.Close(); err != nil {
		return nil, errors.Wrap(err, "GreeterClient.Greet: write")
	}
	req, err := http.NewRequest(http.MethodPost, c.endpoint+"/remoto/Greeter.Greet", buf)
	if err != nil {
		return nil, errors.Wrap(err, "GreeterClient.Greet: new request")
	}
	req.Header.Set("Accept", "application/json; charset=utf-8")
	req.Header.Set("Content-Type", w.FormDataContentType())
	req = req.WithContext(ctx)
	resp, err := c.httpclient.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "GreeterClient.Greet: do")
	}
	if resp.StatusCode != http.StatusOK {
		resp.Body.Close()
		return nil, errors.Errorf("GreeterClient.Greet: remote service returned %s", resp.Status)
	}
	b, err = ioutil.ReadAll(resp.Body)
	resp.Body.Close()
	if err != nil {
		return nil, errors.Wrap(err, "GreeterClient.Greet: read response body")
	}
	var resps []*GreetResponse
	if err := json.Unmarshal(b, &resps); err != nil {
		return nil, errors.Wrap(err, "GreeterClient.Greet: decode response body")
	}
	return resps, nil
}

type GreetRequest struct {
	Name string `json:"name"`
}

type GreetResponse struct {
	Greeting string `json:"greeting"`
	// Error is an error message if one occurred.
	Error string `json:"error"`
}

// contextKey is a local context key type.
// see https://medium.com/@matryer/context-keys-in-go-5312346a868d
type contextKey string

func (c contextKey) String() string {
	return "remoto context key: " + string(c)
}

// contextKeyFiles is the context key for the request files.
var contextKeyFiles = contextKey("files")

// file holds info about a file in the context, including
// the io.Reader where the contents will be read from.
type file struct {
	r        io.Reader
	filename string
}

// this is here so we don't get a compiler complaints.
func init() {
	var _ = remototypes.File{}
	var _ = strconv.Itoa(0)
	var _ = ioutil.Discard
}
