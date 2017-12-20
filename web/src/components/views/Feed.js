import React, { Component } from "react";
import { Row, Col } from "reactstrap";
import Comment from "./Comment";
import Post from "./Post";

class Feed extends Component {
  state = {
    feed: [],
    submit: false,
    loadLastComments: []
  };

  componentWillMount() {
    this.getFeeds();
  }

  getFeeds = () => {
    //this will load the feed to the page and then will load all the comments for each post
    fetch("/api/feed", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      credentials: "same-origin"
    })
      .then(response => {
        if (response.status === 401) 
          this.props.history.push("/");
        if (response.status > 399)
          return [];
        return response.json()
      })
      .then(response =>
        response.map(post => {
          post.comments = [];
          return post;
        })
      )
      .then(response => {
        this.getComments(response);
        this.setState({
          feed: response,
          loadLastComments: []
        });
      });
  };

  getComments = (posts) => {
    posts.map(post => {
      fetch(`/api/post/${post.postID}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        credentials: "same-origin"
      })
      .then(response => {
        if (response.status > 399)
          return [];
        return response.json()
      })
      .then(response => {
        post.comments.push(...response.comments);
        this.setState(prevState => {
          let feed = prevState.feed.map(prevPost => 
            (prevPost.postID === post.postID) ? (
              post
              ) : (
              prevPost
              )
          )
          return feed;
        });
        return post;
      });    
    })
  };

  upDateComments = postID => {
    fetch(`/api/post/${postID}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      credentials: "same-origin"
    })
      .then(resp => {
        if (resp.status > 399)
          return [];
        return resp.json();
      })
      .then(resp => {
        let comment = resp.comments[resp.comments.length - 1];
        this.setState({
          loadLastComments: this.state.feed
            .filter(p => p.postID === postID)[0]
            .comments.push(comment)
        });
      });
  };

  render() { 
    //getting the user type that is passed from the App redirect
    const { user } = this.props;
    return (
      <div>
        {/* if user is an organisation display the post component at the top */}
        {user && user.userType === "organisation" ? (
          <Post user={user} updateFeeds={this.getFeeds} />
        ) : (
          ""
        )}
        {this.state.feed.map((feedData, i) => {
          return (
            <div key={feedData.postID} className="feed">
              <Row className="">
                <div className=" col-lg-3 col-xs-6 col-sm-6 col-md-6">
                  <img
                    className="img-fluid feedPhoto"
                    src={
                      feedData.author.imageSource ||
                      "../assets/images/profile-icon.png"
                    }
                    alt="profile"
                  />
                  <p className="feedColor"> {feedData.author.username}</p>
                </div>
                <div className="feedBody col-lg-9 col-xs-6 col-sm-6 col-md-6">
                  {" "}
                  {feedData.content}
                </div>
              </Row>
              <Row className="interest">
                <div className="col-sm-6 col-md-6 col-lg-6 location">
                  <span className="feedColor">location: </span>
                  <br />
                  {feedData.location}
                </div>
                <div className="col-sm-2 col-md-4 col-lg-6 location">
                  <span className="feedColor">interest: </span>
                  {/* to format the list of interests / tags 
                    if there is more than one interest separet them with /
                  */}
                  {feedData.category.map(
                    (category, i) =>
                      i > 0
                        ? " / " + category.name.toLowerCase()
                        : category.name.toLowerCase()
                  )}
                </div>
              </Row>
              <Comment post={feedData} update={this.upDateComments} />
              <Col>
                <div className="red">
                  {/* here I'm showing comments and the author of the comments  */}

                  {feedData.comments.map((comment, index) => {
                    return (
                      <Row key={index}>
                        <div className="  col-md-5 col-lg-1"/>
                        <div className="feedColor col-sm-4 col-md-5 col-lg-2">{comment.author}</div>
                        <div className="feedComment col-sm-8 col-md-5 col-lg-9">{comment.content}</div>
                      </Row>
                    );
                  })}
                </div>
              </Col>
            </div>
          );
        })}
      </div>
    );
  }
}
export default Feed;
